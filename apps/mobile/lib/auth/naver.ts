/**
 * Naver OAuth - Edge Function 프록시를 통해 처리
 * 브라우저로 Naver 인증 → 딥링크로 앱으로 돌아옴 → 세션 처리
 * docs/providers/naver.md 참조
 */

import * as WebBrowser from "expo-web-browser";
import { supabase } from "../supabase/client";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithNaver() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const redirectScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "logintemplate";

  // Edge Function 로그인 URL (platform=mobile 파라미터로 딥링크 redirect 요청)
  const naverLoginUrl = `${supabaseUrl}/functions/v1/naver-auth/login?platform=mobile`;

  const result = await WebBrowser.openAuthSessionAsync(
    naverLoginUrl,
    `${redirectScheme}://auth/callback`
  );

  if (result.type === "success" && result.url) {
    const url = new URL(result.url);
    const token_hash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "magiclink",
      });
      if (error) throw error;
    }
  }
}
