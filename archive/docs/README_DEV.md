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
- 로컬 `.env.local`은 절대 저장소에 커밋하지 마세요.

문제 발생 시

- Supabase CLI 인증: `supabase login`
- 프로젝트 링크가 실패하면 project-ref 값을 확인하세요(콘솔 URL에서 확인 가능).
