# 개발 환경 (VS Code + Supabase)

복사본: `.env.example` → `.env.local` 후 실제 값을 채우세요. `.env.local`은 절대 커밋하지 마세요.

빠른 시작 (권장)

1. Supabase CLI 설치

  - npm: `npm install -g supabase`
  - 또는 플랫폼 패키지 매니저 사용

2. VS Code에서 Tasks 사용

  - `Terminal` → `Run Task...` → `Supabase: Link Project`로 프로젝트 연결 (project-ref 입력)
  - `Terminal` → `Run Task...` → `Supabase: Start`로 로컬 개발 DB/Studio 시작
  - `Terminal` → `Run Task...` → `Dev: Next`로 Next 개발 서버 실행

3. 수동 명령 예시

  - Supabase link:
    `supabase link --project-ref <project-ref>`

  - Supabase start:
    `supabase start`

  - Next dev:
    `npm install` 후 `npm run dev`

검증

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되어 있는지 확인하세요.
- REST API 테스트:
```
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "https://<project-ref>.supabase.co/rest/v1/posts?select=*"
```

보안

- `SUPABASE_SERVICE_ROLE_KEY`와 같은 서버 전용 키는 Vercel/CI secrets에만 저장하세요.
- 로컬 `.env.local`은 절대 저장소에 커밋하지 마세요。

Debug 엔드포인트 (개발 전용)

- 프로젝트에는 일부 개발/디버그용 서버 엔드포인트(`supabase-admin-*`, `supabase-insert-test` 등)가 존재했습니다. 이러한 엔드포인트는 **기본적으로 비활성화(404)** 되어 있으며, 프로덕션에 절대 활성화하면 안 됩니다.
- 필요 시 로컬에서 임시로 활성화하려면 `.env.local`에 다음 값을 설정하세요:

```env
# 활성화하려면 true로 설정 (개발용에만 사용)
ENABLE_DEBUG_ENDPOINTS=true
```

- 관리자 전용 엔드포인트(예: DB 초기화)는 실행에 `SUPABASE_SERVICE_ROLE_KEY`가 필요하도록 보호되어 있습니다. 서비스 역할 키는 절대 클라이언트에 노출하지 마세요.
- 변경 사항을 PR로 제출하기 전에 모든 디버그 엔드포인트가 비활성화되어 있는지(또는 주석 처리되어 있는지) 확인하세요.

문제 발생 시

- Supabase CLI 인증: `supabase login`
- 프로젝트 링크가 실패하면 project-ref 값을 확인하세요(콘솔 URL에서 확인 가능).
