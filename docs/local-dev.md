# 로컬 개발 환경 설정 가이드

---

## 사전 요구사항

| 도구 | 버전 | 설치 방법 |
|------|------|-----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| Docker | 최신 | [docker.com](https://docker.com) (Supabase 로컬 실행에 필요) |
| Supabase CLI | 최신 | `brew install supabase/tap/supabase` |

> **Docker**: Supabase를 로컬에서 실행하려면 Docker Desktop이 실행 중이어야 합니다.

---

## 1. 의존성 설치

```bash
pnpm install
```

---

## 2. 환경변수 파일 생성

```bash
# Root (Edge Functions용)
cp .env.example .env

# Web 앱
cp apps/web/.env.local.example apps/web/.env.local

# Mobile 앱
cp apps/mobile/.env.example apps/mobile/.env
```

---

## 3. Supabase 로컬 환경 시작

```bash
pnpm supabase:start
```

시작 완료 시 다음과 같은 출력이 나타납니다:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJh...
service_role key: eyJh...
```

---

## 4. 환경변수 값 채우기

Supabase 로컬 환경에서 표시된 값으로 환경변수를 설정합니다:

**`apps/web/.env.local`**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...  # 위 anon key

NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_APPLE_ENABLED=true
NEXT_PUBLIC_AUTH_KAKAO_ENABLED=false
NEXT_PUBLIC_AUTH_NAVER_ENABLED=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`apps/mobile/.env`**:
```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...  # 위 anon key

EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true
EXPO_PUBLIC_AUTH_APPLE_ENABLED=true
EXPO_PUBLIC_AUTH_KAKAO_ENABLED=false
EXPO_PUBLIC_AUTH_NAVER_ENABLED=false
EXPO_PUBLIC_APP_SCHEME=logintemplate
```

**Root `.env`** (Edge Functions용):
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...  # 위 service_role key

SITE_URL=http://localhost:3000
MOBILE_SCHEME=logintemplate
```

---

## 5. OAuth Provider 설정 (선택)

로컬에서 특정 provider를 테스트하려면 해당 provider의 토큰을 발급받아야 합니다:

- [Google 설정](providers/google.md)
- [Apple 설정](providers/apple.md)
- [Kakao 설정](providers/kakao.md)
- [Naver 설정](providers/naver.md)

> 로컬 테스트 없이 DB 구조와 UI만 확인하고 싶다면 provider 설정을 생략해도 됩니다.

---

## 6. 앱 실행

### Web 앱

```bash
pnpm dev:web
# http://localhost:3000 에서 확인
```

### Mobile 앱 (Expo)

```bash
pnpm dev:mobile
# Expo Go 앱으로 QR코드 스캔하여 실행
# 또는: pnpm --filter mobile android / ios
```

### 전체 실행

```bash
pnpm dev
```

---

## 7. Supabase Studio 접속

브라우저에서 `http://127.0.0.1:54323` 접속:
- DB 테이블 확인 (profiles 테이블)
- 사용자 목록 확인 (Authentication > Users)
- SQL 편집기

---

## 8. Edge Functions 로컬 테스트 (Kakao/Naver)

```bash
# supabase/.env.local 파일 생성 (Kakao/Naver 키 포함)
# 그 후:
supabase functions serve --env-file supabase/.env.local
```

로컬 Edge Function URL:
- `http://127.0.0.1:54321/functions/v1/kakao-auth/login`
- `http://127.0.0.1:54321/functions/v1/naver-auth/login`

---

## 유용한 명령어

```bash
# Supabase 상태 확인
supabase status

# DB 초기화 (마이그레이션 재실행)
pnpm supabase:reset

# Supabase 중지
pnpm supabase:stop

# 특정 앱만 빌드
pnpm --filter web build
pnpm --filter mobile build
```
