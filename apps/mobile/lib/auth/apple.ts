/**
 * Apple 로그인 - expo-apple-authentication 사용
 * iOS에서만 동작합니다. (Platform.OS === 'ios' 체크 후 호출)
 * docs/providers/apple.md 참조
 */

import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../supabase/client";

export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) throw error;
    }
  } catch (error: unknown) {
    // ERR_CANCELED: 사용자가 취소한 경우 (정상 동작)
    if ((error as { code?: string }).code === "ERR_CANCELED") return;
    throw error;
  }
}
