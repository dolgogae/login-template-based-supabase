# 쿠팡 파트너스 설정 가이드

쿠팡 파트너스를 웹(AdSense 대안)과 모바일(WebView)에 연동하는 방법입니다.

---

## 쿠팡 파트너스란?

쿠팡 파트너스는 쿠팡의 제휴 마케팅 프로그램입니다.
- 배너/위젯을 통해 사용자가 쿠팡에서 구매하면 수수료 수익 발생
- 별도 심사 없이 빠르게 시작 가능 (AdSense보다 심사 기준 낮음)
- 쿠팡을 자주 사용하는 한국 사용자에게 높은 전환율 기대

---

## 1. 쿠팡 파트너스 가입

1. [쿠팡 파트너스](https://partners.coupang.com) 접속
2. 쿠팡 계정으로 로그인 (없으면 신규 가입)
3. 파트너스 신청 → 사이트/앱 정보 입력
4. 승인 후 대시보드 접근 가능

---

## 2. 배너 위젯 생성 및 embed 코드 발급

1. 파트너스 대시보드 → **배너 위젯** → **위젯 만들기**
2. 원하는 형식 선택:
   - **캐러셀형**: 여러 상품이 슬라이드 형태로 표시
   - **그리드형**: 격자 형태로 상품 표시
   - **단일 상품형**: 특정 상품 1개 표시
3. 크기 선택 (권장: 728×90 배너, 320×100 모바일)
4. **embed 코드** 복사

embed 코드 예시:
```html
<script src="https://ads-partners.coupang.com/g.js"></script>
<script>
    new PartnersCoupang.G({
        "id": 12345678,
        "template": "carousel",
        "trackingCode": "AF_XXXXXXXXXX",
        "width": "728",
        "height": "90"
    });
</script>
```

여기서:
- `id`: 파트너스 ID (숫자)
- `trackingCode`: 추적 코드 (AF_ 로 시작)

---

## 3. 환경변수 설정

### 웹 (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_ADS_COUPANG_ENABLED=true
NEXT_PUBLIC_ADS_COUPANG_ID=12345678            # 파트너스 ID (숫자)
NEXT_PUBLIC_ADS_COUPANG_TRACKING_CODE=AF_XXXXXXXXXX
```

### 모바일 (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_ADS_COUPANG_ENABLED=true
EXPO_PUBLIC_ADS_COUPANG_ID=12345678
EXPO_PUBLIC_ADS_COUPANG_TRACKING_CODE=AF_XXXXXXXXXX
```

---

## 4. 컴포넌트 사용법

### 웹 (Next.js)

```tsx
import { CoupangBanner } from "@/components/ads/CoupangBanner";

export default function DashboardPage() {
  return (
    <main>
      {/* 728x90 배너 (데스크탑) */}
      <CoupangBanner width={728} height={90} template="carousel" />

      {/* 320x100 배너 (모바일) */}
      <CoupangBanner width={320} height={100} template="carousel" className="md:hidden" />
    </main>
  );
}
```

### 모바일 (React Native)

```tsx
import { CoupangBanner } from "@/components/ads/CoupangBanner";

export default function HomeScreen() {
  return (
    <View>
      {/* 콘텐츠 */}
      <CoupangBanner width={320} height={100} template="carousel" />
    </View>
  );
}
```

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `width` | `number` | `728` (웹) / `320` (모바일) | 배너 너비 (px) |
| `height` | `number` | `90` (웹) / `100` (모바일) | 배너 높이 (px) |
| `template` | `string` | `"carousel"` | 위젯 형식 (`carousel`, `grid`, `single`) |
| `className` | `string` | - | CSS 클래스 (웹 전용) |

---

## 5. 수익 구조

- **CPC (클릭당 과금)**: 사용자가 배너 클릭 시 소액 수익
- **CPS (판매당 수수료)**: 사용자가 쿠팡에서 구매 시 판매가의 1~5% 수수료
- 수익 정산: 익월 말일 지급

---

## 6. 주의사항

- 쿠팡 파트너스 링크를 클릭한 사용자가 24시간 내에 구매 시 수수료 발생
- 본인이 직접 클릭하여 구매하는 것은 정책 위반
- 오해를 유발하는 방식으로 광고 배치 금지
- 정확한 수익 및 정책은 [쿠팡 파트너스 약관](https://partners.coupang.com) 확인

---

## 참고

- [쿠팡 파트너스 공식 사이트](https://partners.coupang.com)
- [쿠팡 파트너스 FAQ](https://partners.coupang.com/faq)
