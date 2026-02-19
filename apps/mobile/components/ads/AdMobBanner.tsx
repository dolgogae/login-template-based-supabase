import { getAdMobConfig, getAdMobUnitId } from "@repo/ads";
import { Platform } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

export function AdMobBanner() {
  const config = getAdMobConfig();

  if (!config.enabled) return null;

  const platform = Platform.OS as "android" | "ios";
  if (platform !== "android" && platform !== "ios") return null;

  const unitId = getAdMobUnitId("banner", platform);

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}
