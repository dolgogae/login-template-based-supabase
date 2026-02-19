# Google AdSense 설정 가이드

Next.js 웹 앱에 Google AdSense 광고를 연동하는 방법입니다.

---

## 1. AdSense 계정 생성 및 승인

1. [Google AdSense](https://www.google.com/adsense) 접속 후 Google 계정으로 로그인
2. 웹사이트 URL 입력 후 신청
3. AdSense 코드를 사이트 `<head>`에 삽입 (이 템플릿은 자동 처리)
4. Google 검토 완료 대기 (보통 1~2주 소요)
5. **승인 완료 후에만 실제 광고가 표시됩니다**

> **중요**: AdSense는 트래픽이 있는 실제 운영 사이트에서만 승인됩니다.
> 로컬호스트에서는 테스트가 제한적입니다.

---

## 2. Publisher ID 확인

승인 완료 후 AdSense 대시보드에서 **Publisher ID** 확인:
- 형식: `ca-pub-XXXXXXXXXX` (10자리 숫자)
- 위치: AdSense 대시보드 → 계정 → 계정 정보

---

## 3. 광고 슬롯 생성

1. AdSense 대시보드 → **광고** → **광고 단위 기준** → **디스플레이 광고**
2. 광고 이름 입력 → 크기 설정 (반응형 권장)
3. **저장 및 코드 가져오기**
4. 코드에서 `data-ad-slot` 값 복사 (숫자 ID)

---

## 4. 환경변수 설정

`apps/web/.env.local`에 발급받은 ID를 입력합니다:

```bash
NEXT_PUBLIC_ADS_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADS_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX    # Publisher ID
NEXT_PUBLIC_ADS_ADSENSE_SLOT_ID=XXXXXXXXXX             # 광고 슬롯 ID
```

---

## 5. 컴포넌트 사용법

```tsx
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";

export default function DashboardPage() {
  return (
    <main>
      {/* 콘텐츠 */}

      {/* 배너 광고 - ADSENSE_ENABLED=false 시 null 반환 */}
      <AdSenseBanner className="my-4" responsive />

      {/* 특정 크기 지정 */}
      <AdSenseBanner style={{ width: 728, height: 90 }} format="horizontal" responsive={false} />
    </main>
  );
}
```

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `className` | `string` | - | 컨테이너 CSS 클래스 |
| `style` | `CSSProperties` | - | 인라인 스타일 |
| `format` | `string` | `"auto"` | 광고 형식 (`auto`, `horizontal`, `rectangle`, `vertical`) |
| `responsive` | `boolean` | `true` | 반응형 광고 활성화 |

---

## 6. 자동 광고 vs 수동 배치

이 템플릿은 **수동 배치** 방식을 사용합니다.

- **자동 광고**: AdSense가 페이지에서 자동으로 광고 위치 결정 → 제어 어려움
- **수동 배치**: 개발자가 원하는 위치에 `<AdSenseBanner />`를 직접 삽입 → 레이아웃 제어 쉬움

자동 광고를 원한다면 `apps/web/app/layout.tsx`에서 AdSense 스크립트 로드 방식을 수정하세요.

---

## 7. 정책 준수

AdSense 사용 시 다음 정책을 반드시 준수해야 합니다:

- 페이지당 광고 슬롯 수 제한 없음 (단, 콘텐츠보다 광고가 많으면 안 됨)
- 광고를 클릭하도록 유도하는 텍스트 금지
- 성인 콘텐츠, 저작권 위반 페이지에 광고 게재 금지
- 로그인 화면, 감사 페이지 등 콘텐츠 없는 페이지에 광고 금지

---

## 참고

- [AdSense 정책 센터](https://support.google.com/adsense/answer/48182)
- [AdSense 도움말](https://support.google.com/adsense)
- [Next.js에서 AdSense 사용](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
