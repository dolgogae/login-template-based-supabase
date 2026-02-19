# Supabase Login Template

Google, Apple, Kakao, Naver OAuth를 지원하는 Supabase 기반 로그인 템플릿입니다.
Android, iOS, Web 5가지 플랫폼 조합을 선택해서 다음 프로젝트를 시작할 수 있습니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | Turborepo + pnpm |
| Web | Next.js 14 (App Router) + Tailwind CSS |
| Mobile | Expo (React Native) |
| 인증 | Supabase Auth + Edge Functions |
| 언어 | TypeScript |

## 플랫폼 케이스

| 케이스 | 설명 |
|--------|------|
| 1-1 | Android 단일 |
| 1-2 | Android + Web |
| 1-3 | Android + iOS |
| 1-4 | Android + iOS + Web (기본) |
| 1-5 | Web 단일 |

→ 상세 가이드: [docs/platform-cases.md](docs/platform-cases.md)

## 빠른 시작

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repo-url>
cd login-template-based-supabase
pnpm install
```

### 2. 플랫폼 케이스 선택
사용할 플랫폼에 맞게 불필요한 앱 디렉토리를 삭제합니다.
자세한 내용: [docs/platform-cases.md](docs/platform-cases.md)

### 3. 환경변수 설정

**Root (Edge Functions용)**
```bash
cp .env.example .env
```

**Web 앱**
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

**Mobile 앱**
```bash
cp apps/mobile/.env.example apps/mobile/.env
```

각 `.env` 파일을 열어 값을 채워넣으세요.

### 4. Supabase 로컬 개발 환경 시작
```bash
pnpm supabase:start
```

### 5. 앱 실행

**Web**
```bash
pnpm dev:web
```

**Mobile**
```bash
pnpm dev:mobile
```

→ 전체 로컬 설정 가이드: [docs/local-dev.md](docs/local-dev.md)

## Provider 설정

사용할 OAuth provider의 토큰 발급 방법:

| Provider | 가이드 |
|----------|--------|
| Google | [docs/providers/google.md](docs/providers/google.md) |
| Apple | [docs/providers/apple.md](docs/providers/apple.md) |
| Kakao | [docs/providers/kakao.md](docs/providers/kakao.md) |
| Naver | [docs/providers/naver.md](docs/providers/naver.md) |

### Provider 활성화/비활성화

환경변수 하나로 제어합니다 (코드 변경 없음):

```bash
# Web (.env.local)
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_APPLE_ENABLED=true
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false   # false → 버튼 숨김
NEXT_PUBLIC_AUTH_NAVER_ENABLED=false

# Mobile (.env)
EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
EXPO_PUBLIC_AUTH_APPLE_ENABLED=true    # iOS에서만 실제 버튼 표시
EXPO_PUBLIC_AUTH_KAKAO_ENABLED=false
EXPO_PUBLIC_AUTH_NAVER_ENABLED=false
```

> **Note**: Apple 로그인은 모바일에서 iOS에서만 표시됩니다. Android에서는 자동으로 숨겨집니다.

## 프로젝트 구조

```
login-template-based-supabase/
├── apps/
│   ├── web/               # Next.js (Web)
│   └── mobile/            # Expo (Android + iOS)
├── packages/
│   ├── ads/               # 광고 토글 로직 (getEnabledAds, getAdMobUnitId)
│   ├── supabase/          # 공유 타입 + provider 토글 로직
│   ├── ui/                # 공유 디자인 토큰
│   ├── typescript-config/ # 공유 TS 설정
│   └── eslint-config/     # 공유 ESLint 설정
├── supabase/
│   ├── migrations/        # DB 마이그레이션
│   └── functions/
│       ├── kakao-auth/    # Kakao OAuth 프록시
│       └── naver-auth/    # Naver OAuth 프록시
└── docs/                  # 가이드 문서
```

## Kakao / Naver 인증 방식

Supabase는 Kakao/Naver를 기본 지원하지 않습니다. 이 템플릿은 **Supabase Edge Functions**를 OAuth 프록시로 사용합니다.

```
앱 → Edge Function → Kakao/Naver 인증 → 사용자 정보 → Supabase 세션 발급 → 앱
```

자세한 내용: [docs/edge-functions.md](docs/edge-functions.md)

## 주요 스크립트

```bash
pnpm dev           # 모든 앱 개발 서버 시작
pnpm dev:web       # Web만 시작
pnpm dev:mobile    # Mobile만 시작
pnpm build         # 전체 빌드
pnpm lint          # 린트 검사
pnpm type-check    # TypeScript 타입 검사

pnpm supabase:start          # 로컬 Supabase 시작
pnpm supabase:stop           # 로컬 Supabase 중지
pnpm supabase:reset          # DB 초기화 (마이그레이션 재실행)
pnpm supabase:functions:serve # Edge Functions 로컬 실행
```

## 광고 연동

환경변수 하나로 광고를 활성화/비활성화할 수 있습니다 (코드 변경 없음).

| 플랫폼 | 광고 네트워크 | 가이드 |
|--------|-------------|--------|
| Web | Google AdSense | [docs/ads/adsense.md](docs/ads/adsense.md) |
| Web + Mobile | 쿠팡 파트너스 | [docs/ads/coupang.md](docs/ads/coupang.md) |
| Mobile | Google AdMob | [docs/ads/admob.md](docs/ads/admob.md) |

### 광고 활성화 예시

```bash
# Web (.env.local)
NEXT_PUBLIC_ADS_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADS_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADS_ADSENSE_SLOT_ID=XXXXXXXXXX
NEXT_PUBLIC_ADS_COUPANG_ENABLED=true
NEXT_PUBLIC_ADS_COUPANG_ID=12345678
NEXT_PUBLIC_ADS_COUPANG_TRACKING_CODE=AF_XXXXXXXXXX

# Mobile (.env)
EXPO_PUBLIC_ADS_ADMOB_ENABLED=true
EXPO_PUBLIC_ADS_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADS_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADS_COUPANG_ENABLED=true
EXPO_PUBLIC_ADS_COUPANG_ID=12345678
EXPO_PUBLIC_ADS_COUPANG_TRACKING_CODE=AF_XXXXXXXXXX
```

> **AdMob 주의**: AdMob은 네이티브 빌드가 필요합니다. Expo Go에서는 동작하지 않습니다.
> EAS Build 또는 `npx expo prebuild` 후 실행하세요.

---

## 이 템플릿으로 새 프로젝트 시작하기

1. 이 저장소를 복제하거나 fork합니다
2. [플랫폼 케이스](docs/platform-cases.md)에 맞게 불필요한 app 디렉토리를 삭제합니다
3. 사용할 provider의 [토큰을 발급](docs/providers/)합니다
4. 환경변수 파일을 설정합니다
5. 비즈니스 로직을 `apps/web/app/(protected)/` 또는 `apps/mobile/app/(app)/`에 추가합니다
6. (선택) 광고 연동: 각 [docs/ads/](docs/ads/) 가이드를 따라 env var를 설정합니다
