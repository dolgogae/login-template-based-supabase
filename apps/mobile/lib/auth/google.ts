/**
 * Google OAuth - expo-auth-session 사용
 * Google Cloud Console에서 Android/iOS용 OAuth 클라이언트 ID가 필요합니다.
 * docs/providers/google.md 참조
 */

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { supabase } from "../supabase/client";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const signIn = async () => {
    const result = await promptAsync();
    if (result.type === "success") {
      const { id_token } = result.params;
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: id_token,
      });
      if (error) throw error;
    }
  };

  return { signIn, isLoading: !request };
}
