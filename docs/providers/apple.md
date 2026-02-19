# Apple Sign In 설정 가이드

> **주의**: Apple Developer 계정이 필요합니다 (연 $99, 약 13만원).
> iOS 앱에서 소셜 로그인을 제공한다면 App Store 정책상 Apple Sign In을 **반드시** 포함해야 합니다.

---

## 1. App ID 생성 (모바일용)

1. [Apple Developer Console](https://developer.apple.com/account) 에 접속합니다.
2. **Certificates, Identifiers & Profiles** > **Identifiers** 로 이동합니다.
3. **+** 버튼 클릭 > **App IDs** 선택 > **Continue**
4. 유형: **App** 선택 > **Continue**
5. 입력:
   - **Description**: 앱 이름 (예: `My Login App`)
   - **Bundle ID**: Explicit 선택 후 `apps/mobile/app.json`의 `ios.bundleIdentifier` 값 입력 (예: `com.yourcompany.logintemplate`)
6. 스크롤 다운하여 **Capabilities** 목록에서 **Sign In with Apple** 체크
7. **Continue** > **Register**

---

## 2. Service ID 생성 (웹 OAuth용)

> 웹 앱(Next.js)에서 Apple 로그인을 사용하거나, Supabase에 Apple provider를 등록하려면 Service ID가 필요합니다.

1. **Identifiers** > **+** > **Services IDs** 선택 > **Continue**
2. 입력:
   - **Description**: 서비스 이름 (예: `My Login App Web`)
   - **Identifier**: 고유한 역도메인 형식 (예: `com.yourcompany.logintemplate.web`)
3. **Continue** > **Register**
4. 방금 만든 Service ID를 클릭하여 편집 모드로 진입
5. **Sign In with Apple** 체크 > **Configure** 클릭
6. 설정:
   - **Primary App ID**: 위에서 만든 App ID 선택
   - **Domains and Subdomains**: `[your-project-ref].supabase.co` 추가
   - **Return URLs**: `https://[your-project-ref].supabase.co/auth/v1/callback` 추가
7. **Save** > **Continue** > **Save**

---

## 3. Private Key 생성

> Supabase가 Apple과 통신하기 위한 비밀 키입니다.

1. **Keys** > **+** 버튼 클릭
2. 입력:
   - **Key Name**: 키 이름 (예: `Supabase Apple Key`)
3. **Sign In with Apple** 체크 > **Configure**
4. Primary App ID 선택 > **Save**
5. **Continue** > **Register**
6. **Download** 버튼으로 `.p8` 파일 다운로드

> **⚠️ 중요**: `.p8` 파일은 다운로드 기회가 **1번**입니다. 반드시 안전한 곳에 보관하세요.

7. 다음 정보를 기록해두세요:
   - **Key ID**: 키 목록에서 확인 (10자리 영문+숫자)
   - **Team ID**: 우측 상단 계정 이름 옆 또는 **Membership** 탭에서 확인 (10자리)

---

## 4. Supabase 대시보드 등록

1. [Supabase 대시보드](https://supabase.com/dashboard) > Authentication > Providers
2. **Apple** 활성화
3. 입력:
   - **Service ID**: Service ID의 Identifier (예: `com.yourcompany.logintemplate.web`)
   - **Team ID**: Apple Developer Team ID (10자리)
   - **Key ID**: Private Key의 Key ID (10자리)
   - **Private Key**: `.p8` 파일의 내용 전체 (-----BEGIN PRIVATE KEY----- 포함)
4. **Save**

---

## 5. 환경변수 설정

**`apps/web/.env.local`**
```bash
NEXT_PUBLIC_AUTH_APPLE_ENABLED=true
```

**`apps/mobile/.env`**
```bash
EXPO_PUBLIC_AUTH_APPLE_ENABLED=true
# Apple 로그인은 iOS에서만 버튼이 표시됩니다 (Platform.OS 자동 처리)
```

---

## 6. iOS 모바일 앱 특이사항

- 이 템플릿은 `expo-apple-authentication`을 사용합니다.
- iOS 기기에서 **네이티브 Apple Sign In API**를 직접 호출하므로 별도의 OAuth 리디렉션이 없습니다.
- Android에서는 `Platform.OS !== 'ios'` 체크로 자동으로 버튼이 숨겨집니다.
- `app.json`에 `ios.usesAppleSignIn: true`가 설정되어 있어야 합니다 (이미 설정됨).

---

## 주의사항

- `.p8` 파일은 재다운로드 불가. 분실 시 키를 폐기하고 새로 만들어야 합니다.
- Apple은 이메일을 처음 로그인 시에만 제공합니다. 이후 로그인에서는 이메일을 받을 수 없으므로 첫 로그인 시 DB에 저장해야 합니다 (Supabase가 자동 처리).
- 사용자가 "이메일 숨기기"를 선택하면 Apple이 생성한 임시 이메일(`@privaterelay.appleid.com`)이 제공됩니다.
- **App Store 심사**: 소셜 로그인 제공 앱은 Apple Sign In 필수.
