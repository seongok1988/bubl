# Bubl — 임대인 평판 조회 플랫폼

> 세입자가 임대인(집주인)의 평판을 투명하게 확인하고 공유할 수 있는 웹 서비스입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | Next.js 14.1 (App Router) |
| **언어** | TypeScript 5.9 (strict) |
| **스타일** | Tailwind CSS 3.3 |
| **인증 / DB** | Supabase (Auth, PostgreSQL) |
| **린트 / 포맷** | ESLint 9 + Prettier |
| **테스트** | Vitest + React Testing Library |

## 프로젝트 구조

```
├── app/                # Next.js App Router (pages + API routes)
│   ├── api/            # REST API 엔드포인트
│   ├── auth/           # 인증 콜백/리셋 페이지
│   ├── community/      # 커뮤니티 페이지
│   └── page.tsx        # 메인 페이지
├── components/         # React 컴포넌트
├── lib/
│   ├── api/            # Supabase CRUD 래퍼 (클라이언트 → DB)
│   └── hooks/          # React 커스텀 훅
├── services/           # Supabase 클라이언트 인스턴스
│   ├── supabase.ts     # 브라우저용 (anon key)
│   ├── supabase-server.ts  # 서버용 (service role key)
│   └── supabase-auth.ts    # 요청별 인증 클라이언트
├── types/
│   └── db.ts           # 중앙 집중 DB 타입 정의
├── supabase/
│   └── migrations/     # RLS 정책 등 SQL 마이그레이션
└── __tests__/          # 테스트 코드
```

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 URL과 키를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KAKAO_REST_API_KEY=your-kakao-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 4. 빌드 및 배포

```bash
npm run build
npm start
```

## 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 포맷 |
| `npm run format:check` | Prettier 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run test` | Vitest 테스트 실행 |
| `npm run test:ci` | CI용 테스트 (단일 실행) |

## 아키텍처 결정

### Supabase 클라이언트 분리 원칙

| 클라이언트 | 용도 | 키 |
|------------|------|----|
| `services/supabase.ts` | 브라우저 컴포넌트에서 사용 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `services/supabase-server.ts` | API Route에서 관리자 작업 | `SUPABASE_SERVICE_ROLE_KEY` |
| `services/supabase-auth.ts` | API Route에서 사용자 컨텍스트 유지 | 요청 JWT 기반 |

### RLS (Row Level Security)

- 모든 테이블에 RLS가 활성화되어 있습니다.
- 정책은 `supabase/migrations/001_rls_policies.sql`에서 관리합니다.
- API Route에서는 `supabaseAdmin`(service role)으로 RLS를 우회합니다.

## 라이선스

Private
