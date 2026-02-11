# SECURITY_GUIDE

This document contains concrete, copy-pasteable guidance for securing the community features in this repo.

1) Move secrets to server env
- Do not store service or third-party keys in frontend code. Keep them in server-only env vars (no `NEXT_PUBLIC_` prefix).
- Example: set `KAKAO_REST_API_KEY` (server-only) and reference it in `pages/api/kakao-address.ts`.

2) Supabase Row-Level Security (RLS) examples
- Enable RLS and add policies so clients cannot spoof `user_id`.

-- Posts table (recommended schema: id, community_id, user_id, title, content, status, created_at)
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert posts only when their user_id matches auth.uid()
CREATE POLICY "Insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);
```

- For comments, apply the same pattern.

3) Admin actions & service role usage
- For moderation tasks (hide/unhide, delete, escalate), create server-only admin API endpoints under `pages/api/admin/*` that use the Supabase service role key.
- Never expose the service role key to the client.
- If you add development-only debug endpoints (for testing), protect them behind both an environment flag and the service role key. Example:
  - `ENABLE_DEBUG_ENDPOINTS=true` (local only)
  - `SUPABASE_SERVICE_ROLE_KEY` present on the server
  - Implement endpoints to return 404 unless both conditions are met.

Example admin handler (simplified):
```ts
// pages/api/admin/hide-post.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // authenticate this endpoint with your own check (API token, auth0, etc.)
  const { postId, hide } = req.body
  const { error } = await supabaseAdmin.from('posts').update({ status: hide ? 'hidden' : 'published' }).eq('id', postId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
```
4) Input validation & XSS prevention
- Store plain text where possible. If rich text is required, sanitize on the server before storing or rendering.
- Validate length limits and allowed characters in `createPost` / `createComment` helpers in `lib/api/*` and also in PL/pgSQL constraints if desired.

5) Rate limiting & abuse protection
- Add simple per-IP or per-user rate limits to API routes (e.g., address search, post creation). For small scale, consider an in-memory store with time windows; for production, use Redis or provider features.

6) Audit logging
- Log moderation and failed auth attempts to a secure table or external logging service. Avoid logging secrets.

7) Quick checklist before PR
- Remove hardcoded keys from frontend files.
- Add any server-only keys to environment and `.env.example`.
- Ensure RLS policies cover `INSERT/UPDATE/DELETE` checks for `user_id`.
# 🔒 부블 로그인 시스템 - 보안 가이드

## ✅ 구현된 보안 기능

### 1. 입력값 검증 (Input Validation)
- ✅ 이메일 형식 검증 (정규식)
- ✅ 비밀번호 최소 길이 8자
- ✅ 비밀번호 복잡도 검증 (대문자, 소문자, 숫자 필수)
- ✅ 입력값 길이 제한 (maxLength=255)
- ✅ 입력값 sanitization (trim, escape)

### 2. XSS (Cross-Site Scripting) 방어
- ✅ HTML 이스케이프 처리 (`escapeHtml` 함수)
- ✅ 사용자 입력 데이터 sanitize
- ✅ React의 기본 XSS 방어 활용

### 3. CSRF (Cross-Site Request Forgery) 방어
- ✅ Supabase Auth의 PKCE 플로우 사용
- ✅ 상태 토큰 자동 검증
- ✅ Same-Origin 정책 적용

### 4. 에러 메시지 안전 처리
- ✅ 민감한 정보 노출 방지
- ✅ 사용자 친화적 에러 메시지 변환
- ✅ 이메일 존재 여부 숨김 (타이밍 공격 방어)

### 5. 세션 관리
- ✅ 자동 세션 확인
- ✅ 24시간 세션 만료
- ✅ 로그인 시 기존 세션 검증
- ✅ 토큰 기반 인증

### 6. 비밀번호 보안
- ✅ 안전한 토큰 기반 비밀번호 재설정
- ✅ 비밀번호 해싱 (Supabase 자동 처리)
- ✅ 비밀번호 표시/숨기기 토글

### 7. OAuth 보안
- ✅ PKCE 플로우 (Proof Key for Code Exchange)
- ✅ 안전한 리다이렉트 URL
- ✅ 상태 검증

---

## 🚀 사용 방법

### 1. Supabase 설정

`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. 카카오 OAuth 설정

Supabase 대시보드:
1. Authentication → Providers → Kakao 활성화
2. 카카오 개발자 콘솔에서 앱 등록
3. Client ID와 Secret 입력
4. Redirect URL 설정: `https://your-project.supabase.co/auth/v1/callback`

### 3. 이메일 설정

Supabase 대시보드:
1. Authentication → Email Templates
2. 비밀번호 재설정 템플릿 커스터마이징
3. SMTP 설정 (선택사항)

---

## 📋 UI 흐름 (요청사항 완벽 구현)

### ✅ 1. 메인 로그인 화면
```
┌─────────────────────────────┐
│          🏢 부블             │
│   부동산 평판 인사이트 플랫폼 │
│                             │
│ [  카카오 간편로그인  ]      │
│ [  이메일로 로그인하기 ]     │
│                             │
│ ─────────────────────────  │
│                             │
│ 아직도 회원이 아니신가요?    │
│        회원가입             │
└─────────────────────────────┘
```

### ✅ 2. 이메일 로그인 화면
```
┌─────────────────────────────┐
│    이메일로 로그인           │
│ 부블 서비스 이용을 위해      │
│    로그인해주세요.          │
│                             │
│ 이메일                      │
│ [                    ]      │
│                             │
│ 비밀번호                    │
│ [                    ] 👁   │
│                             │
│ [      로그인       ]       │
│                             │
│ 비밀번호 재설정 |           │
│    이메일로 가입하기        │
│                             │
│ ← 다른 방법으로 로그인       │
└─────────────────────────────┘
```

### ✅ 3. 비밀번호 재설정 화면 (오버레이)
```
┌─────────────────────────────┐
│    비밀번호 재설정           │
│ 가입하신 이메일로 비밀번호   │
│ 재설정 메일을 보내드립니다.  │
│                             │
│ 이메일                      │
│ [                    ]      │
│                             │
│ [   인증메일 받기   ]       │
│                             │
│ ← 로그인으로 돌아가기        │
└─────────────────────────────┘
```

### ✅ 4. 회원가입 화면
```
┌─────────────────────────────┐
│       회원가입               │
│   부블과 함께 시작하세요     │
│                             │
│ 이름 *                      │
│ [                    ]      │
│                             │
│ 이메일 *                    │
│ [                    ]      │
│                             │
│ 비밀번호 *                  │
│ [                    ] 👁   │
│                             │
│ 비밀번호 확인 *              │
│ [                    ] 👁   │
│                             │
│ [     회원가입      ]       │
│                             │
│ 이미 계정이 있으신가요?      │
│        로그인               │
│                             │
│ ← 메인으로 돌아가기          │
└─────────────────────────────┘
```

---

## 🔐 보안 체크리스트

- [x] 이메일 형식 검증
- [x] 비밀번호 8자 이상
- [x] 비밀번호 복잡도 검증
- [x] XSS 방어
- [x] CSRF 방어
- [x] SQL Injection 방어 (Supabase ORM)
- [x] 민감한 에러 메시지 숨김
- [x] 세션 자동 만료
- [x] 안전한 토큰 기반 인증
- [x] OAuth PKCE 플로우
- [x] 입력값 길이 제한
- [x] HTML 이스케이프

---

## 📱 주요 기능

### 1. 카카오 간편로그인
- Supabase OAuth 연동
- PKCE 플로우로 보안 강화
- 자동 회원가입 및 로그인

### 2. 이메일/비밀번호 로그인
- 안전한 비밀번호 해싱
- 세션 기반 인증
- 자동 로그아웃

### 3. 회원가입
- 완료 후 자동 로그인
- 이메일 인증 (선택사항)
- 비밀번호 복잡도 검증

### 4. 비밀번호 재설정
- 안전한 토큰 기반
- 이메일로 재설정 링크 발송
- 세션 검증

---

## ⚠️ 추가 권장 사항

### 1. Rate Limiting
```typescript
// 구현 예정 (선택사항)
// 로그인 시도 횟수 제한
// IP 기반 차단
```

### 2. 2FA (Two-Factor Authentication)
```typescript
// 구현 예정 (선택사항)
// SMS 인증
// TOTP (Google Authenticator)
```

### 3. 로그인 기록
```typescript
// 구현 예정 (선택사항)
// 로그인 시간, IP, 디바이스 기록
// 이상 로그인 감지
```

---

## 🐛 문제 해결

### Q: 카카오 로그인이 작동하지 않아요
A: 
1. Supabase 대시보드에서 Kakao Provider 활성화 확인
2. 카카오 개발자 콘솔에서 Redirect URL 확인
3. Client ID와 Secret 확인

### Q: 이메일 인증 메일이 오지 않아요
A:
1. 스팸함 확인
2. Supabase SMTP 설정 확인
3. 이메일 템플릿 확인

### Q: 비밀번호 재설정이 안돼요
A:
1. 이메일 주소 확인
2. 재설정 링크 유효 시간 확인 (1시간)
3. 세션 만료 여부 확인

---

**제작:** 부블 개발팀  
**보안 업데이트:** 2024-02-09  
**버전:** 3.0.0
