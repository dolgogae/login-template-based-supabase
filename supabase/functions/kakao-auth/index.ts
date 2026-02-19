/**
 * Kakao OAuth 프록시 Edge Function
 *
 * GET /kakao-auth/login   → Kakao 인증 화면으로 redirect
 * GET /kakao-auth/callback → Kakao code를 받아 Supabase 세션 발급
 *
 * 환경변수 필요:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   KAKAO_REST_API_KEY
 *   KAKAO_CLIENT_SECRET     (선택 - Client Secret 사용 시)
 *   SITE_URL                (웹 앱 URL, 예: https://your-app.com)
 *   MOBILE_SCHEME           (모바일 딥링크 스킴, 예: logintemplate)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // POST preflight
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
  const kakaoClientId = Deno.env.get("KAKAO_REST_API_KEY")!;
  const kakaoClientSecret = Deno.env.get("KAKAO_CLIENT_SECRET") ?? "";
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
  const mobileScheme = Deno.env.get("MOBILE_SCHEME") ?? "logintemplate";

  const callbackUrl = `${supabaseUrl}/functions/v1/kakao-auth/callback`;

  // ── Step 1: 로그인 시작 (/login) ──────────────────────────────────
  if (pathname.endsWith("/login")) {
    const platform = url.searchParams.get("platform") ?? "web"; // 'web' | 'mobile'
    const state = btoa(JSON.stringify({ platform, timestamp: Date.now() }));

    const kakaoAuthUrl = new URL(KAKAO_AUTH_URL);
    kakaoAuthUrl.searchParams.set("client_id", kakaoClientId);
    kakaoAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    kakaoAuthUrl.searchParams.set("response_type", "code");
    kakaoAuthUrl.searchParams.set("scope", "account_email profile_nickname profile_image");
    kakaoAuthUrl.searchParams.set("state", state);

    return Response.redirect(kakaoAuthUrl.toString(), 302);
  }

  // ── Step 2: 콜백 처리 (/callback) ────────────────────────────────
  if (pathname.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error || !code) {
      const redirectTo = `${siteUrl}/login?error=${encodeURIComponent(error ?? "kakao_auth_failed")}`;
      return Response.redirect(redirectTo, 302);
    }

    // state에서 platform 추출
    let platform = "web";
    try {
      const stateData = JSON.parse(atob(stateParam ?? ""));
      platform = stateData.platform ?? "web";
    } catch {
      // state 파싱 실패 시 web으로 fallback
    }

    // 2-1. Kakao code → access_token 교환
    const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: kakaoClientId,
        client_secret: kakaoClientSecret,
        redirect_uri: callbackUrl,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Kakao token error:", err);
      return Response.redirect(`${siteUrl}/login?error=kakao_token_failed`, 302);
    }

    const { access_token: kakaoAccessToken } = await tokenResponse.json() as {
      access_token: string;
    };

    // 2-2. Kakao 사용자 정보 조회
    const userResponse = await fetch(KAKAO_USER_URL, {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });

    if (!userResponse.ok) {
      return Response.redirect(`${siteUrl}/login?error=kakao_user_failed`, 302);
    }

    const kakaoUser = await userResponse.json() as {
      id: number;
      kakao_account?: {
        email?: string;
        email_needs_agreement?: boolean;
        profile?: {
          nickname?: string;
          profile_image_url?: string;
        };
      };
    };

    // 이메일이 없는 경우 임시 이메일 생성 (Kakao가 이메일 제공을 거부할 수 있음)
    const email = kakaoUser.kakao_account?.email
      ?? `kakao_${kakaoUser.id}@noemail.local`;
    const displayName = kakaoUser.kakao_account?.profile?.nickname ?? `카카오 사용자`;
    const avatarUrl = kakaoUser.kakao_account?.profile?.profile_image_url;

    // 2-3. Supabase Admin API로 사용자 upsert
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 기존 사용자 조회
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      (u) => u.user_metadata?.kakao_id === kakaoUser.id
        || (u.email === email && email !== `kakao_${kakaoUser.id}@noemail.local`)
    );

    let userId: string;

    if (existingUser) {
      // 기존 사용자 메타데이터 업데이트
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "kakao",
          kakao_id: kakaoUser.id,
        },
      });
      userId = existingUser.id;
    } else {
      // 신규 사용자 생성
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "kakao",
          kakao_id: kakaoUser.id,
        },
      });

      if (createError || !newUser.user) {
        console.error("Create user error:", createError);
        return Response.redirect(`${siteUrl}/login?error=user_creation_failed`, 302);
      }

      userId = newUser.user.id;
    }

    // 2-4. 매직링크 생성으로 세션 토큰 발급
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: platform === "mobile" ? `${mobileScheme}://auth/callback` : `${siteUrl}/auth/callback` },
    });

    if (linkError || !linkData.properties) {
      console.error("Generate link error:", linkError);
      return Response.redirect(`${siteUrl}/login?error=session_failed`, 302);
    }

    // 2-5. 플랫폼에 따라 적절한 URL로 redirect
    const { hashed_token, redirect_to } = linkData.properties;
    const confirmUrl = new URL(`${siteUrl}/auth/confirm`);
    confirmUrl.searchParams.set("token_hash", hashed_token);
    confirmUrl.searchParams.set("type", "magiclink");
    confirmUrl.searchParams.set("next", "/dashboard");

    if (platform === "mobile") {
      const mobileUrl = `${mobileScheme}://auth/callback?token_hash=${hashed_token}&type=magiclink`;
      return Response.redirect(mobileUrl, 302);
    }

    return Response.redirect(confirmUrl.toString(), 302);
  }

  return new Response("Not found", { status: 404 });
});
