import { getAdMobConfig, getAdMobUnitId } from "@repo/ads";
import { useCallback } from "react";
import { Platform } from "react-native";
import { useInterstitialAd } from "react-native-google-mobile-ads";

/**
 * AdMob 전면 광고 훅
 *
 * @example
 * const { load, show, isLoaded } = useAdMobInterstitial();
 *
 * // 광고 로드
 * useEffect(() => { load(); }, []);
 *
 * // 원하는 시점에 광고 표시
 * const handleShowAd = async () => {
 *   if (isLoaded) await show();
 * };
 */
export function useAdMobInterstitial() {
  const config = getAdMobConfig();
  const platform = Platform.OS as "android" | "ios";

  const unitId = config.enabled
    ? getAdMobUnitId("interstitial", platform)
    : "ca-app-pub-3940256099942544/1033173712"; // 테스트 ID

  const { isLoaded, load, show } = useInterstitialAd(unitId);

  const safeLoad = useCallback(() => {
    if (!config.enabled) return;
    load();
  }, [config.enabled, load]);

  const safeShow = useCallback(async () => {
    if (!config.enabled || !isLoaded) return;
    await show();
  }, [config.enabled, isLoaded, show]);

  return { load: safeLoad, show: safeShow, isLoaded: config.enabled && isLoaded };
}
