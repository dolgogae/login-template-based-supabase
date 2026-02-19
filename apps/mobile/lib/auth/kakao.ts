/**
 * Kakao OAuth - Edge Function 프록시를 통해 처리
 * 브라우저로 Kakao 인증 → 딥링크로 앱으로 돌아옴 → 세션 처리
 * docs/providers/kakao.md 참조
 */

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../supabase/client";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithKakao() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const redirectScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "logintemplate";

  // Edge Function 로그인 URL (platform=mobile 파라미터로 딥링크 redirect 요청)
  const kakaoLoginUrl = `${supabaseUrl}/functions/v1/kakao-auth/login?platform=mobile`;

  // 인앱 브라우저로 Kakao 인증 페이지 열기
  const result = await WebBrowser.openAuthSessionAsync(
    kakaoLoginUrl,
    `${redirectScheme}://auth/callback`
  );

  if (result.type === "success" && result.url) {
    // Edge Function이 redirect한 URL에서 token_hash 추출
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
