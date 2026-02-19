# 플랫폼 케이스 설정 가이드

이 템플릿은 5가지 플랫폼 조합을 지원합니다.
원하는 케이스에 맞게 불필요한 앱 디렉토리를 삭제하고 환경변수를 설정하세요.

---

## 케이스 1-4: Android + iOS + Web (기본값)

**전체 모노레포를 그대로 사용합니다. 변경 없음.**

```bash
pnpm install
pnpm supabase:start
pnpm dev    # 모든 앱 실행
```

---

## 케이스 1-5: Web 단일

1. **`apps/mobile` 디렉토리 삭제**:
   ```bash
   rm -rf apps/mobile
   ```

2. **`pnpm-workspace.yaml` 수정**:
   현재 상태:
   ```yaml
   packages:
     - apps/*
     - packages/*
   ```
   변경 불필요 (apps/mobile이 없으면 자동으로 무시됨)

3. **환경변수** (`apps/web/.env.local`):
   ```bash
   NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
   NEXT_PUBLIC_AUTH_APPLE_ENABLED=true   # 웹에서 Apple 로그인 가능
   NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false  # 필요 시 true
   NEXT_PUBLIC_AUTH_NAVER_ENABLED=false  # 필요 시 true
   ```

4. **실행**:
   ```bash
   pnpm dev:web
   ```

**제약사항**: 없음. 웹에서 Google, Apple, Kakao, Naver 모두 사용 가능.

---

## 케이스 1-3: Android + iOS

1. **`apps/web` 디렉토리 삭제**:
   ```bash
   rm -rf apps/web
   ```

2. **환경변수** (`apps/mobile/.env`):
   ```bash
   EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
   EXPO_PUBLIC_AUTH_APPLE_ENABLED=true     # iOS에서만 표시됨
   EXPO_PUBLIC_AUTH_KAKAO_ENABLED=false    # 필요 시 true
   EXPO_PUBLIC_AUTH_NAVER_ENABLED=false    # 필요 시 true
   ```

3. **실행**:
   ```bash
   pnpm dev:mobile
   # iOS 빌드: pnpm --filter mobile ios
   # Android 빌드: pnpm --filter mobile android
   ```

**제약사항**:
- Apple 로그인은 iOS에서만 버튼이 표시됩니다. Android에서는 자동으로 숨겨집니다.
- App Store 배포 시 Apple Sign In 필수 (iOS 소셜 로그인 앱 정책).

---

## 케이스 1-2: Android + Web

1. **`apps/mobile/app.json` 수정** - iOS 관련 설정 비활성화:
   ```json
   {
     "expo": {
       "ios": {
         "supportsTablet": false,
         "bundleIdentifier": "com.yourcompany.logintemplate",
         "usesAppleSignIn": false
       }
     }
   }
   ```

2. **환경변수**:

   **`apps/web/.env.local`**:
   ```bash
   NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
   NEXT_PUBLIC_AUTH_APPLE_ENABLED=true    # 웹에서는 Apple 사용 가능
   NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false
   NEXT_PUBLIC_AUTH_NAVER_ENABLED=false
   ```

   **`apps/mobile/.env`**:
   ```bash
   EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
   EXPO_PUBLIC_AUTH_APPLE_ENABLED=false   # Android에서는 Apple 불필요
   EXPO_PUBLIC_AUTH_KAKAO_ENABLED=false
   EXPO_PUBLIC_AUTH_NAVER_ENABLED=false
   ```

3. **실행**:
   ```bash
   pnpm dev:web      # 웹 앱
   pnpm dev:mobile   # 모바일 앱 (Android 전용)
   # Android 빌드: pnpm --filter mobile android
   ```

**제약사항**:
- 모바일에서 Apple Sign In 없음 (Android 미지원).
- Google Play Store는 Apple Sign In 요구사항이 없습니다.

---

## 케이스 1-1: Android 단일

1. **`apps/web` 디렉토리 삭제**:
   ```bash
   rm -rf apps/web
   ```

2. **`apps/mobile/app.json` 수정** - Apple 관련 비활성화:
   ```json
   {
     "expo": {
       "ios": {
         "usesAppleSignIn": false
       },
       "plugins": [
         "expo-router"
       ]
     }
   }
   ```
   (`expo-apple-authentication` 플러그인 제거)

3. **환경변수** (`apps/mobile/.env`):
   ```bash
   EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
   EXPO_PUBLIC_AUTH_APPLE_ENABLED=false   # Android에서 Apple 불필요
   EXPO_PUBLIC_AUTH_KAKAO_ENABLED=false
   EXPO_PUBLIC_AUTH_NAVER_ENABLED=false
   ```

4. **실행**:
   ```bash
   pnpm dev:mobile
   pnpm --filter mobile android
   ```

**제약사항**:
- Apple 로그인 없음 (Android 미지원 + 웹 없음).
- Google Play Store에서는 Apple Sign In 요구사항 없습니다.

---

## 전체 케이스 비교

| 케이스 | Google | Apple (iOS) | Kakao | Naver | 삭제할 것 |
|--------|--------|-------------|-------|-------|-----------|
| 1-1 Android | ✅ | ❌ | 선택 | 선택 | `apps/web` |
| 1-2 Android+Web | ✅ | 웹만 ✅ | 선택 | 선택 | - |
| 1-3 Android+iOS | ✅ | iOS만 ✅ | 선택 | 선택 | `apps/web` |
| 1-4 전체 | ✅ | iOS+웹 ✅ | 선택 | 선택 | - |
| 1-5 Web | ✅ | ✅ | 선택 | 선택 | `apps/mobile` |

---

## Provider 활성화/비활성화

코드 변경 없이 환경변수만으로 버튼 표시 여부를 제어합니다:

```bash
# false 또는 미설정 → 해당 버튼 숨김
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=true    # 웹에 카카오 버튼 표시
EXPO_PUBLIC_AUTH_NAVER_ENABLED=true    # 모바일에 네이버 버튼 표시
```
