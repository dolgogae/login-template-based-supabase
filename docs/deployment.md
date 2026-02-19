# 배포 가이드

로컬 개발이 완료된 후 프로덕션 환경으로 배포하는 전체 절차입니다.

## 배포 순서

```
1. Supabase 프로덕션 프로젝트 설정
        ↓
2. Web 배포 (Vercel)        ←─── 웹이 있는 경우
        ↓
3. Supabase Auth URL 업데이트
        ↓
4. OAuth Provider Redirect URI 업데이트
        ↓
5. Mobile 배포 (EAS Build)  ←─── 모바일이 있는 경우
```

---

## 사전 준비

- [ ] `supabase` CLI 설치 (`brew install supabase/tap/supabase`)
- [ ] `eas-cli` 설치 (`npm install -g eas-cli`) — 모바일 배포 시
- [ ] Supabase 계정
- [ ] Vercel 계정 — 웹 배포 시
- [ ] Expo 계정 — 모바일 배포 시
- [ ] Google Play Console 계정 — Android 배포 시
- [ ] Apple Developer Program 계정 ($99/년) — iOS 배포 시

---

## 1단계: Supabase 프로덕션 설정

### 1-1. 프로젝트 생성

1. [supabase.com/dashboard](https://supabase.com/dashboard) 접속 → **New project**
2. 이름, 비밀번호, 리전(서울: `ap-northeast-2`) 설정
3. 생성 완료 후 **Project Settings → API**에서 값 확인:
   - `Project URL` → `SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (노출 금지)

### 1-2. CLI로 프로젝트 연결

```bash
supabase login
supabase link --project-ref [your-project-ref]
# project-ref: URL의 https://[project-ref].supabase.co 부분
```

### 1-3. DB 마이그레이션 적용

```bash
supabase db push
```

Supabase 대시보드 → Table Editor에서 `profiles` 테이블이 생성됐는지 확인합니다.

### 1-4. Edge Functions 배포 (Kakao / Naver 사용 시)

```bash
supabase functions deploy kakao-auth --project-ref [your-project-ref]
supabase functions deploy naver-auth --project-ref [your-project-ref]
```

배포 확인:
```
https://[your-project-ref].supabase.co/functions/v1/kakao-auth/login
```

### 1-5. Edge Function Secrets 설정

대시보드 → **Edge Functions → Manage secrets** 에서 추가:

| Secret | 값 | 필요 조건 |
|--------|----|----------|
| `KAKAO_REST_API_KEY` | Kakao REST API 키 | Kakao 사용 시 |
| `KAKAO_CLIENT_SECRET` | Kakao Client Secret | Kakao + 보안 강화 시 |
| `NAVER_CLIENT_ID` | Naver Client ID | Naver 사용 시 |
| `NAVER_CLIENT_SECRET` | Naver Client Secret | Naver 사용 시 |
| `SITE_URL` | `https://your-domain.com` | 항상 |
| `MOBILE_SCHEME` | `your-app-scheme` | 모바일 있을 시 |

> `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 자동 주입됩니다.

또는 CLI로 설정:
```bash
supabase secrets set KAKAO_REST_API_KEY=xxx SITE_URL=https://your-domain.com
```

### 1-6. Auth 설정

대시보드 → **Authentication → URL Configuration**:

| 항목 | 값 |
|------|----|
| **Site URL** | `https://your-domain.com` |
| **Redirect URLs** | `https://your-domain.com/**` |
| **Redirect URLs** | `your-app-scheme://` (모바일 딥링크) |

### 1-7. OAuth Provider 활성화

대시보드 → **Authentication → Providers**:

**Google**:
- Client ID: Google Cloud Console Web 클라이언트 ID
- Client Secret: Google Cloud Console Web 클라이언트 Secret
- Authorized redirect URI (Google Cloud에 등록): `https://[project-ref].supabase.co/auth/v1/callback`

**Apple**:
- Service ID: Apple Developer → Identifiers → Services ID (Identifier)
- Secret Key: Apple Developer에서 생성한 `.p8` 키 내용
- Key ID: `.p8` 파일의 Key ID
- Team ID: Apple Developer 계정 Team ID

> 상세 발급 절차: [docs/providers/](providers/)

---

## 2단계: Web 배포 (Vercel)

Turborepo 모노레포에서 `apps/web`만 배포합니다.

### 2-1. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) → **New Project** → GitHub 저장소 연결
2. **Root Directory**: `apps/web`로 설정

   > ⚠️ Turborepo 모노레포에서는 반드시 `apps/web`을 Root Directory로 지정해야 합니다.

3. Framework Preset: **Next.js** (자동 감지)
4. Build Command: 기본값 유지 (`next build`)

### 2-2. 환경변수 설정

Vercel → **Settings → Environment Variables**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 사용할 Provider만 true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_APPLE_ENABLED=true
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false
NEXT_PUBLIC_AUTH_NAVER_ENABLED=false

# 광고 (선택)
NEXT_PUBLIC_ADS_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADS_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADS_ADSENSE_SLOT_ID=XXXXXXXXXX
NEXT_PUBLIC_ADS_COUPANG_ENABLED=false
NEXT_PUBLIC_ADS_COUPANG_ID=XXXXXXXXXX
NEXT_PUBLIC_ADS_COUPANG_TRACKING_CODE=AF_XXXXXXXXXX
```

### 2-3. 배포

```bash
# 자동 배포: GitHub main 브랜치에 push하면 자동 배포됨
git push origin main

# 수동 배포:
vercel --prod
```

### 2-4. 도메인 연결 (선택)

Vercel → **Settings → Domains** → 커스텀 도메인 추가 후 DNS 설정.

---

## 3단계: Supabase Auth URL 업데이트

웹 배포 완료 후 실제 도메인을 Supabase에 반영합니다.

대시보드 → **Authentication → URL Configuration**:
- **Site URL** → `https://your-actual-domain.com` 으로 변경

---

## 4단계: OAuth Provider Redirect URI 업데이트

각 Provider의 개발자 콘솔에서 프로덕션 Redirect URI를 추가합니다.

### Google Cloud Console

[console.cloud.google.com](https://console.cloud.google.com) → OAuth 2.0 클라이언트 → 웹 클라이언트 → **승인된 리디렉션 URI** 추가:
```
https://[project-ref].supabase.co/auth/v1/callback
```

### Apple Developer

[developer.apple.com](https://developer.apple.com) → Identifiers → Services ID → **Return URLs** 추가:
```
https://[project-ref].supabase.co/auth/v1/callback
```

### Kakao Developers (사용 시)

[developers.kakao.com](https://developers.kakao.com) → 앱 → **카카오 로그인 → Redirect URI** 추가:
```
https://[project-ref].supabase.co/functions/v1/kakao-auth/callback
```

### Naver Developers (사용 시)

[developers.naver.com](https://developers.naver.com) → 앱 → **API 설정 → Callback URL** 추가:
```
https://[project-ref].supabase.co/functions/v1/naver-auth/callback
```

---

## 5단계: Mobile 배포 (EAS Build)

AdMob 및 네이티브 모듈이 포함된 경우 반드시 EAS Build를 사용해야 합니다.

### 5-1. 앱 정보 수정

`apps/mobile/app.json`에서 플레이스홀더를 실제 값으로 교체:

```json
{
  "expo": {
    "name": "앱 이름",
    "slug": "app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    },
    "plugins": [
      ["react-native-google-mobile-ads", {
        "androidAppId": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX",
        "iosAppId": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX"
      }]
    ]
  }
}
```

### 5-2. EAS 프로젝트 초기화

```bash
cd apps/mobile
eas login
eas init
# apps/mobile/app.json에 "extra.eas.projectId"가 추가됨
```

### 5-3. eas.json 생성

`apps/mobile/eas.json` 파일 생성:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 5-4. 환경변수 설정 (EAS Secrets)

민감한 값은 EAS Secrets으로 관리합니다:

```bash
# Supabase
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://[project-ref].supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "[anon-key]"

# AdMob (활성화 시)
eas secret:create --scope project --name EXPO_PUBLIC_ADS_ADMOB_ENABLED --value "true"
eas secret:create --scope project --name EXPO_PUBLIC_ADS_ADMOB_ANDROID_APP_ID --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADS_ADMOB_IOS_APP_ID --value "ca-app-pub-..."
```

또는 `apps/mobile/.env` 파일을 직접 사용 (EAS Build는 `.env` 파일도 읽음):
```bash
cp apps/mobile/.env.example apps/mobile/.env
# .env 파일에 실제 값 입력
```

### 5-5. 빌드 실행

```bash
# 전체 플랫폼
eas build --platform all --profile production

# Android만
eas build --platform android --profile production

# iOS만
eas build --platform ios --profile production
```

> 첫 iOS 빌드 시 Apple Developer 계정 인증 및 프로비저닝 프로파일 자동 생성이 진행됩니다.

### 5-6. 스토어 제출

**자동 제출:**
```bash
eas submit --platform android --latest
eas submit --platform ios --latest
```

**수동 제출:**
- Android: EAS에서 `.aab` 다운로드 → [Google Play Console](https://play.google.com/console) 업로드
- iOS: EAS에서 `.ipa` 다운로드 → [App Store Connect](https://appstoreconnect.apple.com) 업로드

### 5-7. 스토어 심사 사항

**Google Play Store**
- 개인정보 처리방침 URL 필수
- 앱 심사 보통 1~3일 소요

**Apple App Store**
- 개인정보 처리방침 URL 필수
- Google/Apple/Kakao/Naver 로그인 구현 시 심사 계정 제공 필요
- Apple Sign In 포함 시 앱 내 모든 소셜 로그인에 동등하게 Apple도 제공해야 함
- 앱 심사 보통 1~3일 소요 (첫 제출 기준)

---

## 배포 후 체크리스트

```
[ ] Supabase 대시보드 → Authentication → Users 에서 실제 가입 확인
[ ] 웹: https://your-domain.com/login 접속 → 로그인 동작 확인
[ ] 웹: /dashboard 직접 접근 시 /login으로 리디렉션 확인
[ ] 모바일: OAuth 로그인 후 딥링크 콜백 정상 동작 확인
[ ] Supabase → Table Editor → profiles 테이블에 신규 사용자 row 생성 확인
[ ] 광고 활성화 시: 배너가 올바른 위치에 표시되는지 확인
[ ] AdMob 활성화 시: 실제 Ad Unit ID 사용 여부 확인 (테스트 ID 아닌지)
```

---

## 문제 해결

### 로그인 후 세션이 저장되지 않는 경우

Supabase **Authentication → URL Configuration**의 Site URL과 Redirect URLs가 실제 배포 URL과 일치하는지 확인합니다.

### Kakao/Naver 로그인 후 에러 페이지로 이동하는 경우

1. Edge Function Secrets에서 `SITE_URL` 값이 실제 배포 URL로 설정됐는지 확인
2. Kakao/Naver Developer Console의 Redirect URI에 프로덕션 Edge Function URL이 등록됐는지 확인

### iOS 빌드에서 Apple Sign In이 동작하지 않는 경우

- `app.json`의 `ios.usesAppleSignIn: true` 확인
- Apple Developer → Identifiers → App ID에서 **Sign In with Apple** capability 활성화 확인

### 모바일에서 딥링크 콜백이 동작하지 않는 경우

- `app.json`의 `scheme` 값이 Supabase Redirect URL의 딥링크 스킴과 일치하는지 확인
- Supabase **Authentication → URL Configuration**에 `your-scheme://` 등록 확인

---

## 참고 문서

- [로컬 개발 가이드](local-dev.md)
- [Edge Functions 가이드](edge-functions.md)
- [플랫폼 케이스 가이드](platform-cases.md)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 모노레포 가이드](https://vercel.com/docs/monorepos/turborepo)
- [EAS Build 공식 문서](https://docs.expo.dev/build/introduction/)
