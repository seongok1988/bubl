# Bubl 프로젝트 Copilot 가이드

## 프로젝트 정보
- **프레임워크**: Next.js 14.1 (App Router) + TypeScript 5.9 (strict)
- **스타일**: Tailwind CSS 3.3
- **백엔드**: Supabase (Auth, PostgreSQL)
- **테스트**: Vitest + React Testing Library
- **린트**: ESLint 9 + Prettier

## 아키텍처 규칙

### Supabase 클라이언트 사용
- 브라우저 컴포넌트: `@/services/supabase` (anon key)
- API Route 관리자: `@/services/supabase-server` (service role key)
- API Route 인증: `@/services/supabase-auth` (요청 JWT 기반)

### Import 규칙
- 타입: `@/types/db`에서 import
- API 함수: `@/lib/api/*`에서 import
- 훅: `@/lib/hooks/*`에서 import
- 경로 별칭: `@/*` 사용 (상대경로 지양)

### 컴포넌트 규칙
- `'use client'`는 항상 파일 첫 줄에 위치
- React Hook은 컴포넌트 최상위에서만 호출
- `any` 타입 사용 최소화

## 스크립트
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run typecheck` — TypeScript 타입 검사
- `npm run test` — Vitest 실행
- `npm run lint` — ESLint 검사
- `npm run format` — Prettier 포맷
