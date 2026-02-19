import type { AdMobAdType, AdMobConfig, AdSenseConfig, CoupangConfig, EnabledAds } from "./types";

// AdMob 테스트 Ad Unit ID (실제 빌드 시 사용 금지)
const ADMOB_TEST_IDS = {
  bannerAndroid: "ca-app-pub-3940256099942544/6300978111",
  bannerIos: "ca-app-pub-3940256099942544/2934735716",
  interstitialAndroid: "ca-app-pub-3940256099942544/1033173712",
  interstitialIos: "ca-app-pub-3940256099942544/4411468910",
  rewardedAndroid: "ca-app-pub-3940256099942544/5224354917",
  rewardedIos: "ca-app-pub-3940256099942544/1712485313",
};

function getEnv(key: string): string | undefined {
  if (typeof process !== "undefined") {
    return (
      process.env[`NEXT_PUBLIC_${key}`] ??
      process.env[`EXPO_PUBLIC_${key}`] ??
      process.env[key]
    );
  }
  return undefined;
}

function isEnabled(key: string): boolean {
  return getEnv(key) === "true";
}

/**
 * 활성화된 광고 네트워크를 반환합니다.
 * AUTH_*_ENABLED 패턴과 동일한 방식으로 env var로 토글합니다.
 */
export function getEnabledAds(): EnabledAds {
  return {
    admob: isEnabled("ADS_ADMOB_ENABLED"),
    adsense: isEnabled("ADS_ADSENSE_ENABLED"),
    coupang: isEnabled("ADS_COUPANG_ENABLED"),
  };
}

/**
 * AdMob 설정을 반환합니다.
 */
export function getAdMobConfig(): AdMobConfig {
  const enabled = isEnabled("ADS_ADMOB_ENABLED");
  return {
    enabled,
    androidAppId: getEnv("ADS_ADMOB_ANDROID_APP_ID") ?? "",
    iosAppId: getEnv("ADS_ADMOB_IOS_APP_ID") ?? "",
    bannerAndroid: getEnv("ADS_ADMOB_BANNER_ANDROID") ?? ADMOB_TEST_IDS.bannerAndroid,
    bannerIos: getEnv("ADS_ADMOB_BANNER_IOS") ?? ADMOB_TEST_IDS.bannerIos,
    interstitialAndroid: getEnv("ADS_ADMOB_INTERSTITIAL_ANDROID") ?? ADMOB_TEST_IDS.interstitialAndroid,
    interstitialIos: getEnv("ADS_ADMOB_INTERSTITIAL_IOS") ?? ADMOB_TEST_IDS.interstitialIos,
    rewardedAndroid: getEnv("ADS_ADMOB_REWARDED_ANDROID") ?? ADMOB_TEST_IDS.rewardedAndroid,
    rewardedIos: getEnv("ADS_ADMOB_REWARDED_IOS") ?? ADMOB_TEST_IDS.rewardedIos,
  };
}

/**
 * 플랫폼(android/ios)에 따른 AdMob Ad Unit ID를 반환합니다.
 * ADMOB_ENABLED=false이거나 ID 미설정 시 테스트 ID를 반환합니다.
 *
 * @param type - "banner" | "interstitial" | "rewarded"
 * @param platform - "android" | "ios"
 */
export function getAdMobUnitId(type: AdMobAdType, platform: "android" | "ios"): string {
  const config = getAdMobConfig();

  if (!config.enabled) {
    // 비활성화 시 테스트 ID 반환
    const testKey = `${type}${platform === "android" ? "Android" : "Ios"}` as keyof typeof ADMOB_TEST_IDS;
    return ADMOB_TEST_IDS[testKey];
  }

  switch (type) {
    case "banner":
      return platform === "android" ? config.bannerAndroid : config.bannerIos;
    case "interstitial":
      return platform === "android" ? config.interstitialAndroid : config.interstitialIos;
    case "rewarded":
      return platform === "android" ? config.rewardedAndroid : config.rewardedIos;
  }
}

/**
 * AdSense 설정을 반환합니다 (웹 전용).
 */
export function getAdSenseConfig(): AdSenseConfig {
  return {
    enabled: isEnabled("ADS_ADSENSE_ENABLED"),
    clientId: getEnv("ADS_ADSENSE_CLIENT_ID") ?? "",
    slotId: getEnv("ADS_ADSENSE_SLOT_ID") ?? "",
  };
}

/**
 * 쿠팡 파트너스 설정을 반환합니다 (웹 + 모바일).
 */
export function getCoupangConfig(): CoupangConfig {
  return {
    enabled: isEnabled("ADS_COUPANG_ENABLED"),
    partnersId: getEnv("ADS_COUPANG_ID") ?? "",
    trackingCode: getEnv("ADS_COUPANG_TRACKING_CODE") ?? "",
  };
}
