# Kakao 로그인 설정 가이드

> Kakao는 Supabase가 네이티브로 지원하지 않아 **Edge Function 프록시** 방식을 사용합니다.
> `docs/edge-functions.md`에서 동작 원리를 확인하세요.

---

## 1. Kakao Developers 앱 생성

1. [https://developers.kakao.com](https://developers.kakao.com) 에 접속합니다.
2. 우측 상단 **로그인** > Kakao 계정으로 로그인합니다.
3. 상단 메뉴 **내 애플리케이션** > **애플리케이션 추가하기** 클릭
4. 입력:
   - **앱 이름**: 앱 이름 (예: `My Login App`)
   - **회사명**: 개인이면 본인 이름 입력 가능
5. **저장** 클릭

---

## 2. 앱 키 확인

1. 생성된 앱 클릭 > **앱 키** 탭
2. **REST API 키**를 복사합니다.

---

## 3. 카카오 로그인 활성화

1. 왼쪽 메뉴: **제품 설정** > **카카오 로그인**
2. **활성화 설정** 토글을 **ON** 으로 변경
3. **OpenID Connect 활성화** 토글도 **ON** 으로 변경 (선택사항, 권장)

---

## 4. Redirect URI 등록

1. **카카오 로그인** > **Redirect URI** 섹션
2. **Redirect URI 등록** 버튼 클릭
3. 다음 URL을 추가합니다:

**로컬 개발용** (Supabase 로컬):
```
http://localhost:54321/functions/v1/kakao-auth/callback
```

**프로덕션용**:
```
https://[your-project-ref].supabase.co/functions/v1/kakao-auth/callback
```

> `[your-project-ref]`는 Supabase 대시보드 > Settings > General에서 확인

4. **저장** 클릭

---

## 5. 동의항목 설정

1. 왼쪽 메뉴: **제품 설정** > **카카오 로그인** > **동의항목**
2. 다음 항목을 **필수 동의** 또는 **선택 동의**로 설정합니다:

| 항목 | 권장 설정 |
|------|-----------|
| 닉네임 | 필수 동의 |
| 프로필 사진 | 선택 동의 |
| 카카오계정(이메일) | 선택 동의* |

> **이메일**: 사업자 등록이 없는 개인 앱은 이메일을 **필수 동의**로 설정할 수 없습니다.
> 이메일 없이 로그인하는 경우, Edge Function이 `kakao_{id}@noemail.local` 형태의 임시 이메일을 생성합니다.

---

## 6. Client Secret 설정 (선택사항, 보안 강화)

1. **카카오 로그인** > **보안** 탭
2. **Client Secret** > **코드 생성** 클릭
3. 생성된 코드를 복사합니다.
4. **활성화 상태**: **사용함**으로 설정

---

## 7. 환경변수 설정

**Root `.env`** (Edge Functions에서 사용):
```bash
KAKAO_REST_API_KEY=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret   # Client Secret 사용 시만
```

**`apps/web/.env.local`**:
```bash
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=true
```

**`apps/mobile/.env`**:
```bash
EXPO_PUBLIC_AUTH_KAKAO_ENABLED=true
```

---

## 8. Edge Function 환경변수 등록

Supabase 대시보드에서 Edge Function용 Secret을 등록해야 합니다:

1. [Supabase 대시보드](https://supabase.com/dashboard) > **Edge Functions** > **Secrets**
2. 다음 키-값 추가:
   - `KAKAO_REST_API_KEY`: 카카오 REST API 키
   - `KAKAO_CLIENT_SECRET`: 카카오 Client Secret (사용 시)
   - `SITE_URL`: 웹 앱 URL (예: `https://your-domain.com`)
   - `MOBILE_SCHEME`: 앱 딥링크 스킴 (예: `logintemplate`)

---

## 동작 방식

```
로그인 버튼 클릭
  → Edge Function(/kakao-auth/login)
  → 카카오 OAuth 동의 화면
  → 사용자 동의
  → Edge Function(/kakao-auth/callback)
  → Supabase 사용자 생성/갱신
  → 매직링크로 세션 발급
  → 앱/웹으로 redirect
```

자세한 내용: [docs/edge-functions.md](../edge-functions.md)
