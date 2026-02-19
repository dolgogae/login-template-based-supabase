import { getAdMobConfig, getAdMobUnitId } from "@repo/ads";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import { type RewardedAdReward, useRewardedAd } from "react-native-google-mobile-ads";

/**
 * AdMob 보상형 광고 훅
 *
 * @example
 * const { load, show, isLoaded } = useAdMobRewarded({
 *   onRewarded: (reward) => {
 *     console.log("보상:", reward.type, reward.amount);
 *   }
 * });
 *
 * // 광고 로드
 * useEffect(() => { load(); }, []);
 *
 * // 원하는 시점에 광고 표시
 * const handleWatchAd = async () => {
 *   if (isLoaded) await show();
 * };
 */
export function useAdMobRewarded(options?: {
  onRewarded?: (reward: RewardedAdReward) => void;
}) {
  const config = getAdMobConfig();
  const platform = Platform.OS as "android" | "ios";

  const unitId = config.enabled
    ? getAdMobUnitId("rewarded", platform)
    : "ca-app-pub-3940256099942544/5224354917"; // 테스트 ID

  const { isLoaded, isEarnedReward, reward, load, show } = useRewardedAd(unitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  // 보상 획득 시 콜백 실행
  useEffect(() => {
    if (isEarnedReward && reward && options?.onRewarded) {
      options.onRewarded(reward);
    }
  }, [isEarnedReward, reward, options?.onRewarded]);

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
