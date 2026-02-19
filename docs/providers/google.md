# Google OAuth 설정 가이드

---

## 1. Google Cloud Console 접속

1. [https://console.cloud.google.com](https://console.cloud.google.com) 에 접속합니다.
2. Google 계정으로 로그인합니다.

---

## 2. 프로젝트 생성

1. 상단 네비게이션 바에서 프로젝트 선택 드롭다운 클릭
2. **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: `my-login-app`)
4. **만들기** 클릭

---

## 3. OAuth 동의 화면 설정

1. 왼쪽 메뉴: **APIs 및 서비스** > **OAuth 동의 화면**
2. 사용자 유형 선택:
   - **외부(External)**: 일반 Google 계정 사용자. 개발/테스트 중에는 **테스트 모드**로 사용하고 프로덕션 배포 시 Google 검수 신청
3. 앱 정보 입력:
   - 앱 이름, 사용자 지원 이메일
   - 승인된 도메인: `supabase.co` 추가
4. 범위(Scopes) 추가:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. 테스트 사용자: 테스트에 사용할 Google 계정 이메일 추가

---

## 4. OAuth 2.0 클라이언트 ID 생성

### 4-1. 웹 애플리케이션 (Next.js)

1. **APIs 및 서비스** > **사용자 인증 정보** > **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
2. 애플리케이션 유형: **웹 애플리케이션**
3. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
4. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   > `[your-project-ref]`는 Supabase 대시보드 > Settings > General에서 확인

5. **만들기** → **클라이언트 ID**와 **클라이언트 보안 비밀번호** 저장

### 4-2. Android (Expo 모바일)

1. 애플리케이션 유형: **Android**
2. **패키지 이름**: `apps/mobile/app.json`의 `android.package` 값과 동일
3. **SHA-1 지문** (개발용 debug keystore):
   ```bash
   keytool -list -v \
     -keystore ~/.android/debug.keystore \
     -alias androiddebugkey \
     -storepass android \
     -keypass android
   ```
   출력의 `SHA1:` 값 복사
4. **만들기** → **클라이언트 ID** 저장 (보안 비밀번호 없음)

> 배포 시에는 프로덕션 서명 키의 SHA-1도 등록 필요

### 4-3. iOS (Expo 모바일)

1. 애플리케이션 유형: **iOS**
2. **번들 ID**: `apps/mobile/app.json`의 `ios.bundleIdentifier` 값과 동일
3. **만들기** → **클라이언트 ID** 저장

---

## 5. Supabase 대시보드 등록

1. [Supabase 대시보드](https://supabase.com/dashboard) > Authentication > Providers
2. **Google** 활성화
3. 입력:
   - **Client ID**: 웹 애플리케이션 클라이언트 ID
   - **Client Secret**: 웹 애플리케이션 클라이언트 보안 비밀번호
4. **Save**

---

## 6. 환경변수 설정

**`apps/web/.env.local`**
```bash
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
```

**`apps/mobile/.env`**
```bash
EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=yyy.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=zzz.apps.googleusercontent.com
```

---

## 주의사항

- **클라이언트 보안 비밀번호는 클라이언트(브라우저, 앱)에 절대 노출하지 마세요.**
- 리디렉션 URI는 정확히 일치해야 합니다. 슬래시 하나 차이로도 `redirect_uri_mismatch` 오류가 발생합니다.
- 외부 앱의 테스트 모드에서는 등록된 테스트 사용자만 로그인 가능합니다.
- **iOS 앱 심사 정책**: 소셜 로그인을 제공하는 앱은 Apple Sign In도 필수로 포함해야 합니다.
