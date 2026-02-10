CI/CD 환경변수 업데이트 및 배포 검증 안내

1) Vercel: 자동 반영 스크립트
- 파일: `scripts/update_vercel_env.ps1`
- 사용법 (PowerShell):
  ```powershell
  $Env:VERCEL_TOKEN = '<your-vercel-token>'
  $Env:VERCEL_PROJECT_ID = '<your-project-id>'
  pwsh .\scripts\update_vercel_env.ps1
  ```
- 설명: `.env.local`에서 키를 읽어 Vercel 프로젝트(Preview/Production)에 생성/갱신합니다.

2) GitHub Actions: 시크릿 반영 스크립트
- 파일: `scripts/update_github_secrets.ps1`
- 사용법 (PowerShell, gh CLI 필요):
  ```powershell
  $Env:REPO = 'owner/repo'
  pwsh .\scripts\update_github_secrets.ps1
  ```
- 설명: `gh secret set`를 사용해 레포지토리 시크릿을 설정합니다.

3) 배포/검증
- Vercel 대시보드에서 Redeploy를 트리거하거나, 로컬에서 `vercel --prod`로 배포합니다.
- 배포 후 다음 엔드포인트로 동작 확인:
  ```bash
  curl -i "https://<your-deploy-url>/api/posts?communityId=<VALID_UUID>"
  curl -i "https://<your-deploy-url>/api/posts/<VALID_POST_ID>"
  ```

4) 권장 추가 작업
- 레포 전체에 민감값이 남아있지 않은지 재검사: `git grep -n "sb_publishable_"` 등
- 빌드 아티팩트(`.next`)가 커밋 히스토리에 남아있다면 `git-filter-repo` 또는 BFG로 제거(팀 동의 필요).
