# Naver 로그인 설정 가이드

> Naver도 Supabase가 네이티브로 지원하지 않아 **Edge Function 프록시** 방식을 사용합니다.
> `docs/edge-functions.md`에서 동작 원리를 확인하세요.

---

## 1. Naver Developers 앱 생성

1. [https://developers.naver.com](https://developers.naver.com) 에 접속합니다.
2. 우측 상단 **로그인** > Naver 계정으로 로그인합니다.
3. 상단 메뉴 **Application** > **내 애플리케이션** > **애플리케이션 등록** 클릭

---

## 2. 애플리케이션 정보 입력

1. **애플리케이션 이름** 입력 (예: `My Login App`)
2. **사용 API** 선택:
   - **네이버 로그인** 선택
3. **로그인 오픈 API 서비스 환경** 설정:

### PC 웹 환경 추가 (웹 앱 사용 시)
- **서비스 URL**: `http://localhost:3000` (개발) 또는 `https://your-domain.com` (프로덕션)
- **네이버 아이디로 로그인 Callback URL**:
  ```
  https://[your-project-ref].supabase.co/functions/v1/naver-auth/callback
  ```

### 모바일 웹 환경 추가 (모바일 앱 사용 시)
- **서비스 URL**: `http://localhost:19006` (Expo 로컬) 또는 앱 딥링크
- **네이버 아이디로 로그인 Callback URL**: 위와 동일

4. **등록하기** 클릭

---

## 3. 앱 키 확인

등록 완료 후 앱 정보 페이지에서:
- **Client ID** 복사
- **Client Secret** 복사 (보안 처리 후 표시됨)

---

## 4. 제공 정보 설정

1. 앱 설정 > **API 설정** 탭
2. **네이버 로그인** 항목에서 제공받을 정보 선택:
   - 이름 (필수)
   - 이메일 주소 (필수)
   - 프로필 사진 (선택)
   - 닉네임 (선택)

> Naver는 이메일을 필수로 요청할 수 있어 Kakao보다 이메일 획득이 용이합니다.

---

## 5. 환경변수 설정

**Root `.env`** (Edge Functions에서 사용):
```bash
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

**`apps/web/.env.local`**:
```bash
NEXT_PUBLIC_AUTH_NAVER_ENABLED=true
```

**`apps/mobile/.env`**:
```bash
EXPO_PUBLIC_AUTH_NAVER_ENABLED=true
```

---

## 6. Edge Function 환경변수 등록

Supabase 대시보드에서 Edge Function용 Secret 등록:

1. [Supabase 대시보드](https://supabase.com/dashboard) > **Edge Functions** > **Secrets**
2. 다음 키-값 추가:
   - `NAVER_CLIENT_ID`: 네이버 Client ID
   - `NAVER_CLIENT_SECRET`: 네이버 Client Secret
   - `SITE_URL`: 웹 앱 URL (예: `https://your-domain.com`)
   - `MOBILE_SCHEME`: 앱 딥링크 스킴 (예: `logintemplate`)

---

## 7. 검수 신청 (프로덕션)

- **검수 전**: 앱 등록자 Naver 계정만 로그인 가능
- **검수 후**: 모든 Naver 사용자 로그인 가능
- Naver 개발자 센터 > 해당 앱 > **검수 요청** 메뉴에서 신청

---

## 동작 방식

```
로그인 버튼 클릭
  → Edge Function(/naver-auth/login)
  → 네이버 OAuth 동의 화면
  → 사용자 동의
  → Edge Function(/naver-auth/callback)
  → Supabase 사용자 생성/갱신
  → 매직링크로 세션 발급
  → 앱/웹으로 redirect
```

자세한 내용: [docs/edge-functions.md](../edge-functions.md)
