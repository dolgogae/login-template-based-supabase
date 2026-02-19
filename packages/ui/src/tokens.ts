/**
 * 디자인 토큰 - Web(Tailwind class)과 Mobile(NativeWind/StyleSheet) 공용
 * provider별 브랜드 색상 정의
 */
export const providerColors = {
  google: {
    background: "#FFFFFF",
    text: "#3C4043",
    border: "#DADCE0",
    icon: "#4285F4",
  },
  apple: {
    background: "#000000",
    text: "#FFFFFF",
    border: "#000000",
    icon: "#FFFFFF",
  },
  kakao: {
    background: "#FEE500",
    text: "#000000",
    border: "#FEE500",
    icon: "#000000",
  },
  naver: {
    background: "#03C75A",
    text: "#FFFFFF",
    border: "#03C75A",
    icon: "#FFFFFF",
  },
} as const;

export type ProviderColorKey = keyof typeof providerColors;
