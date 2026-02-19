import { getCoupangConfig } from "@repo/ads";
import { WebView } from "react-native-webview";

interface CoupangBannerProps {
  width?: number;
  height?: number;
  template?: string;
}

/**
 * 쿠팡 파트너스 배너 광고 (WebView 기반)
 *
 * EXPO_PUBLIC_ADS_COUPANG_ENABLED=true 시 활성화됩니다.
 *
 * @example
 * <CoupangBanner width={320} height={100} />
 */
export function CoupangBanner({
  width = 320,
  height = 100,
  template = "carousel",
}: CoupangBannerProps) {
  const config = getCoupangConfig();

  if (!config.enabled || !config.partnersId || !config.trackingCode) return null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: transparent; }
  </style>
</head>
<body>
  <script src="https://ads-partners.coupang.com/g.js"></script>
  <script>
    new PartnersCoupang.G({
      id: ${config.partnersId},
      template: "${template}",
      trackingCode: "${config.trackingCode}",
      width: "${width}",
      height: "${height}"
    });
  </script>
</body>
</html>
  `.trim();

  return (
    <WebView
      source={{ html }}
      style={{ width, height }}
      scrollEnabled={false}
      javaScriptEnabled
      originWhitelist={["*"]}
    />
  );
}
