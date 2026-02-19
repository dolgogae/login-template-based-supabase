export type AdNetwork = "admob" | "adsense" | "coupang";

export type AdMobAdType = "banner" | "interstitial" | "rewarded";

export interface EnabledAds {
  admob: boolean;   // 모바일 전용 (react-native-google-mobile-ads)
  adsense: boolean; // 웹 전용 (Google AdSense)
  coupang: boolean; // 웹 + 모바일 (쿠팡 파트너스)
}

export interface AdMobConfig {
  enabled: boolean;
  androidAppId: string;
  iosAppId: string;
  bannerAndroid: string;
  bannerIos: string;
  interstitialAndroid: string;
  interstitialIos: string;
  rewardedAndroid: string;
  rewardedIos: string;
}

export interface AdSenseConfig {
  enabled: boolean;
  clientId: string; // ca-pub-XXXXXXXXXX
  slotId: string;
}

export interface CoupangConfig {
  enabled: boolean;
  partnersId: string;      // 파트너스 ID (숫자)
  trackingCode: string;    // AF_XXXXXXXXXX
}
