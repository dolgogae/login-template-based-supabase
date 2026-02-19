"use client";

import { getCoupangConfig } from "@repo/ads";
import { useEffect, useRef } from "react";

interface CoupangBannerProps {
  width?: number;
  height?: number;
  template?: string;
  className?: string;
}

/**
 * 쿠팡 파트너스 배너 광고
 *
 * NEXT_PUBLIC_ADS_COUPANG_ENABLED=true 시 활성화됩니다.
 *
 * @example
 * <CoupangBanner width={728} height={90} template="carousel" />
 */
export function CoupangBanner({
  width = 728,
  height = 90,
  template = "carousel",
  className,
}: CoupangBannerProps) {
  const config = getCoupangConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!config.enabled || !config.partnersId || !config.trackingCode) return;
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.src = "https://ads-partners.coupang.com/g.js";
    script.async = true;
    script.onload = () => {
      const w = window as typeof window & {
        PartnersCoupang?: {
          G: new (opts: {
            id: string;
            template: string;
            trackingCode: string;
            width: string;
            height: string;
          }) => void;
        };
      };
      if (w.PartnersCoupang) {
        new w.PartnersCoupang.G({
          id: config.partnersId,
          template,
          trackingCode: config.trackingCode,
          width: String(width),
          height: String(height),
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config.enabled, config.partnersId, config.trackingCode, width, height, template]);

  if (!config.enabled || !config.partnersId || !config.trackingCode) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, overflow: "hidden" }}
    />
  );
}
