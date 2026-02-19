/**
 * Naver OAuth 프록시 Edge Function
 *
 * GET /naver-auth/login    → Naver 인증 화면으로 redirect
 * GET /naver-auth/callback → Naver code를 받아 Supabase 세션 발급
 *
 * 환경변수 필요:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NAVER_CLIENT_ID
 *   NAVER_CLIENT_SECRET
 *   SITE_URL                (웹 앱 URL, 예: https://your-app.com)
 *   MOBILE_SCHEME           (모바일 딥링크 스킴, 예: logintemplate)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_USER_URL = "https://openapi.naver.com/v1/nid/me";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const naverClientId = Deno.env.get("NAVER_CLIENT_ID")!;
  const naverClientSecret = Deno.env.get("NAVER_CLIENT_SECRET")!;
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
  const mobileScheme = Deno.env.get("MOBILE_SCHEME") ?? "logintemplate";

  const callbackUrl = `${supabaseUrl}/functions/v1/naver-auth/callback`;

  // ── Step 1: 로그인 시작 (/login) ──────────────────────────────────
  if (pathname.endsWith("/login")) {
    const platform = url.searchParams.get("platform") ?? "web";
    const state = btoa(JSON.stringify({ platform, timestamp: Date.now() }));

    const naverAuthUrl = new URL(NAVER_AUTH_URL);
    naverAuthUrl.searchParams.set("response_type", "code");
    naverAuthUrl.searchParams.set("client_id", naverClientId);
    naverAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    naverAuthUrl.searchParams.set("state", state);

    return Response.redirect(naverAuthUrl.toString(), 302);
  }

  // ── Step 2: 콜백 처리 (/callback) ────────────────────────────────
  if (pathname.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error || !code) {
      return Response.redirect(`${siteUrl}/login?error=${encodeURIComponent(error ?? "naver_auth_failed")}`, 302);
    }

    let platform = "web";
    try {
      const stateData = JSON.parse(atob(stateParam ?? ""));
      platform = stateData.platform ?? "web";
    } catch {
      // fallback to web
    }

    // 2-1. Naver code → access_token 교환
    const tokenUrl = new URL(NAVER_TOKEN_URL);
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", naverClientId);
    tokenUrl.searchParams.set("client_secret", naverClientSecret);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("state", stateParam ?? "");

    const tokenResponse = await fetch(tokenUrl.toString(), {
      headers: { "X-Naver-Client-Id": naverClientId, "X-Naver-Client-Secret": naverClientSecret },
    });

    if (!tokenResponse.ok) {
      return Response.redirect(`${siteUrl}/login?error=naver_token_failed`, 302);
    }

    const { access_token: naverAccessToken } = await tokenResponse.json() as {
      access_token: string;
    };

    // 2-2. Naver 사용자 정보 조회
    const userResponse = await fetch(NAVER_USER_URL, {
      headers: { Authorization: `Bearer ${naverAccessToken}` },
    });

    if (!userResponse.ok) {
      return Response.redirect(`${siteUrl}/login?error=naver_user_failed`, 302);
    }

    const naverData = await userResponse.json() as {
      resultcode: string;
      message: string;
      response: {
        id: string;
        email?: string;
        name?: string;
        nickname?: string;
        profile_image?: string;
      };
    };

    if (naverData.resultcode !== "00") {
      return Response.redirect(`${siteUrl}/login?error=naver_user_failed`, 302);
    }

    const naverUser = naverData.response;
    const email = naverUser.email ?? `naver_${naverUser.id}@noemail.local`;
    const displayName = naverUser.name ?? naverUser.nickname ?? `네이버 사용자`;
    const avatarUrl = naverUser.profile_image;

    // 2-3. Supabase Admin API로 사용자 upsert
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      (u) => u.user_metadata?.naver_id === naverUser.id
        || (u.email === email && email !== `naver_${naverUser.id}@noemail.local`)
    );

    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "naver",
          naver_id: naverUser.id,
        },
      });
    } else {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "naver",
          naver_id: naverUser.id,
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        return Response.redirect(`${siteUrl}/login?error=user_creation_failed`, 302);
      }
    }

    // 2-4. 매직링크로 세션 토큰 발급
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: platform === "mobile" ? `${mobileScheme}://auth/callback` : `${siteUrl}/auth/callback` },
    });

    if (linkError || !linkData.properties) {
      return Response.redirect(`${siteUrl}/login?error=session_failed`, 302);
    }

    const { hashed_token } = linkData.properties;

    if (platform === "mobile") {
      const mobileUrl = `${mobileScheme}://auth/callback?token_hash=${hashed_token}&type=magiclink`;
      return Response.redirect(mobileUrl, 302);
    }

    const confirmUrl = new URL(`${siteUrl}/auth/confirm`);
    confirmUrl.searchParams.set("token_hash", hashed_token);
    confirmUrl.searchParams.set("type", "magiclink");
    confirmUrl.searchParams.set("next", "/dashboard");

    return Response.redirect(confirmUrl.toString(), 302);
  }

  return new Response("Not found", { status: 404 });
});
