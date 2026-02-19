import type { EnabledProviders } from "./types.js";

/**
 * 환경변수를 읽어 활성화된 OAuth provider 목록을 반환합니다.
 * Next.js: NEXT_PUBLIC_AUTH_*_ENABLED
 * Expo:    EXPO_PUBLIC_AUTH_*_ENABLED
 *
 * 사용법:
 *   const providers = getEnabledProviders();
 *   if (providers.google) { ... }
 */
export function getEnabledProviders(): EnabledProviders {
  const get = (key: string) => {
    // Next.js 환경
    const next = typeof process !== "undefined" ? process.env[`NEXT_PUBLIC_${key}`] : undefined;
    // Expo 환경
    const expo = typeof process !== "undefined" ? process.env[`EXPO_PUBLIC_${key}`] : undefined;
    return next === "true" || expo === "true";
  };

  return {
    google: get("AUTH_GOOGLE_ENABLED"),
    apple: get("AUTH_APPLE_ENABLED"),
    kakao: get("AUTH_KAKAO_ENABLED"),
    naver: get("AUTH_NAVER_ENABLED"),
  };
}
