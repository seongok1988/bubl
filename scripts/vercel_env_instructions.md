Vercel 환경변수 설정 안내

프로젝트가 Vercel에 연결되어 있을 때, 아래 환경변수를 'Server' 또는 'Production'에 추가하세요.

필수 환경변수 (이름만 입력; 값은 실제 키로 대체)

- KAKAO_REST_API_KEY  (server-only)
- NEXT_PUBLIC_SUPABASE_URL  (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY  (public)
- SUPABASE_SERVICE_ROLE_KEY  (server-only)

설정 방법 (간단)
1. Vercel 대시보드 접속 → 프로젝트 선택
2. Settings → Environment Variables
3. Add New:
   - Key: (위 이름)
   - Value: (실제 키)
   - Environment: Production (및 Preview/Development 필요 시 추가)
   - 클릭하여 저장
4. 값 추가/변경 시 Vercel이 자동으로 새 배포를 트리거합니다.

추가 권장
- server-only 항목은 절대 `NEXT_PUBLIC_`로 두지 마세요.
- 비밀은 팀의 비밀 관리 정책에 따라 주기적으로 회전하세요.

CLI를 통한 설정(선택)
- Vercel CLI(`vercel` 또는 `vc`)와 `VERCEL_TOKEN`이 있을 때:
  ```bash
  vercel env add KAKAO_REST_API_KEY production
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  vercel env add SUPABASE_SERVICE_ROLE_KEY production
  ```
- CLI로 값을 넣으려면 `VERCEL_TOKEN`을 환경변수로 설정하고 실행하세요.

문의: 제가 Vercel에 직접 설정해드리려면 `VERCEL_TOKEN`과 `VERCEL_PROJECT_ID`를 제공해 주세요. (보안상 권장하지 않음 — 가능하면 직접 입력 바랍니다.)
