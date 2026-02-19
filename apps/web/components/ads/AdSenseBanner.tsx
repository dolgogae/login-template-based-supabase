"use client";

import { getAdSenseConfig } from "@repo/ads";
import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  className?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
}

/**
 * Google AdSense 배너 광고
 *
 * NEXT_PUBLIC_ADS_ADSENSE_ENABLED=true 시 활성화됩니다.
 * AdSense 승인 완료 + Publisher ID, Slot ID 설정 필요.
 *
 * @example
 * <AdSenseBanner className="my-4" responsive />
 */
export function AdSenseBanner({
  className,
  style,
  format = "auto",
  responsive = true,
}: AdSenseBannerProps) {
  const config = getAdSenseConfig();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!config.enabled || pushed.current) return;
    try {
      const w = window as typeof window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      (w.adsbygoogle as unknown[]).push({});
      pushed.current = true;
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, [config.enabled]);

  if (!config.enabled || !config.clientId || !config.slotId) return null;

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", ...style }}
      data-ad-client={config.clientId}
      data-ad-slot={config.slotId}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
