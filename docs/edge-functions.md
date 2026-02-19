# Edge Functions 가이드 (Kakao / Naver)

Supabase는 Kakao와 Naver를 기본 OAuth Provider로 지원하지 않습니다.
이 템플릿은 **Supabase Edge Functions를 OAuth 프록시로 사용**하여 이 문제를 해결합니다.

---

## 왜 Edge Function이 필요한가?

Supabase의 기본 OAuth Provider는 **OIDC(OpenID Connect) 표준**을 준수하는 서비스만 지원합니다.
Kakao와 Naver는 OIDC Discovery Document(`/.well-known/openid-configuration`)를 완전히 지원하지 않아
Supabase의 기본 Custom OAuth Provider 기능을 사용할 수 없습니다.

**해결책**: Supabase Edge Function이 Kakao/Naver OAuth를 직접 처리하고,
Supabase Auth의 Admin API를 통해 사용자를 생성한 후 세션을 발급합니다.

---

## 동작 흐름

```
┌─────────────┐
│  앱 (웹/모바일)│
└──────┬──────┘
       │ 1. 로그인 버튼 클릭
       ▼
┌─────────────────────────────┐
│  Edge Function              │
│  /kakao-auth/login          │
│  (또는 /naver-auth/login)   │
└──────────┬──────────────────┘
           │ 2. Kakao/Naver 인증 URL로 redirect
           ▼
┌─────────────────────┐
│  Kakao / Naver      │
│  OAuth 동의 화면     │
└──────┬──────────────┘
       │ 3. 사용자 동의 완료
       ▼
┌─────────────────────────────┐
│  Edge Function              │
│  /kakao-auth/callback       │
│  1) code → access_token 교환 │
│  2) 사용자 정보 조회         │
│  3) Supabase user upsert    │
│  4) 매직링크 발급           │
└──────────┬──────────────────┘
           │ 5. redirect
           ▼
┌────────────────────────────────────┐
│  웹: /auth/confirm?token_hash=...  │
│  앱: logintemplate://auth/callback │
└────────────────────────────────────┘
           │ 6. OTP 검증 → 세션 생성
           ▼
┌─────────────┐
│  로그인 완료 │
└─────────────┘
```

---

## Edge Function 코드 위치

```
supabase/functions/
├── kakao-auth/index.ts    # Kakao OAuth 프록시
└── naver-auth/index.ts    # Naver OAuth 프록시
```

각 함수는 두 가지 경로를 처리합니다:
- `/[function-name]/login`: Kakao/Naver 인증 화면으로 redirect
- `/[function-name]/callback`: 코드 교환 + Supabase 세션 발급

---

## 로컬 개발 테스트

### 1. Supabase 로컬 환경 시작

```bash
pnpm supabase:start
```

### 2. Edge Function 환경변수 설정

로컬 Supabase는 `supabase/.env.local` 파일을 참조합니다:

```bash
# supabase/.env.local (생성 필요)
KAKAO_REST_API_KEY=your-kakao-key
KAKAO_CLIENT_SECRET=your-kakao-secret
NAVER_CLIENT_ID=your-naver-id
NAVER_CLIENT_SECRET=your-naver-secret
SITE_URL=http://localhost:3000
MOBILE_SCHEME=logintemplate
```

### 3. Edge Functions 실행

```bash
pnpm supabase:functions:serve
# 또는 특정 함수만:
supabase functions serve kakao-auth --env-file supabase/.env.local
```

로컬 Edge Function URL:
- Kakao: `http://127.0.0.1:54321/functions/v1/kakao-auth/login`
- Naver: `http://127.0.0.1:54321/functions/v1/naver-auth/login`

### 4. Kakao/Naver Developer Console에서 로컬 Redirect URI 등록

Kakao Developers에서 Redirect URI 추가:
```
http://localhost:54321/functions/v1/kakao-auth/callback
```

Naver Developers에서 Callback URL 추가:
```
http://localhost:54321/functions/v1/naver-auth/callback
```

---

## 프로덕션 배포

### 1. Edge Function 배포

```bash
supabase functions deploy kakao-auth --project-ref [your-project-ref]
supabase functions deploy naver-auth --project-ref [your-project-ref]
```

### 2. Supabase 대시보드에서 Secrets 설정

[Supabase 대시보드](https://supabase.com/dashboard) > Edge Functions > Secrets

| Secret 이름 | 값 |
|-------------|-----|
| `KAKAO_REST_API_KEY` | Kakao REST API 키 |
| `KAKAO_CLIENT_SECRET` | Kakao Client Secret (사용 시) |
| `NAVER_CLIENT_ID` | Naver Client ID |
| `NAVER_CLIENT_SECRET` | Naver Client Secret |
| `SITE_URL` | 웹 앱 URL (예: `https://your-domain.com`) |
| `MOBILE_SCHEME` | 앱 딥링크 스킴 (예: `logintemplate`) |

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Edge Functions 환경에 자동으로 주입됩니다.

### 3. Kakao/Naver Developer Console에서 프로덕션 Redirect URI 등록

```
https://[your-project-ref].supabase.co/functions/v1/kakao-auth/callback
https://[your-project-ref].supabase.co/functions/v1/naver-auth/callback
```

---

## 보안 고려사항

- `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 내부에서만 사용되며 클라이언트에 절대 노출되지 않습니다.
- `state` 파라미터를 사용하여 CSRF 공격을 방어합니다.
- 매직링크 토큰은 일회용이며 만료됩니다.
- Supabase의 RLS(Row Level Security)로 데이터 접근이 제어됩니다.
