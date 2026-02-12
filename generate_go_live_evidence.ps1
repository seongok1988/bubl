# Go-Live Evidence 자동 생성 스크립트 (Windows PowerShell)
# 실행 예시: powershell -ExecutionPolicy Bypass -File .\generate_go_live_evidence.ps1

$evidenceDir = "evidence/20260212_go_live"
$manifestPath = "$evidenceDir/manifest.json"

# 1. policy_db_sync_audit.sql 실행 및 CSV 저장
# 2. governance_report 생성
# 3. 공격 시뮬레이션 결과 저장
# 4. MV refresh 로그 저장
# 5. audit_log 샘플 추출
# 6. snapshot 생성 로그 저장

# 실제 쿼리/실행은 아래 예시를 참고하여 구현

# 파일 체크섬 계산 함수
function Get-FileSHA256($filePath) {
    if (Test-Path $filePath) {
        return (Get-FileHash $filePath -Algorithm SHA256).Hash
    } else {
        return ""
    }
}

# 증빙 파일 목록
$files = @(
    "policy_db_sync_result.csv",
    "governance_report.csv",
    "attack_simulation_report.csv",
    "mv_refresh_log.txt",
    "audit_log_sample.csv",
    "snapshot_log.txt"
)

# 모든 파일 생성 성공 여부 확인
$allExist = $true
foreach ($f in $files) {
    if (-not (Test-Path "$evidenceDir/$f")) {
        $allExist = $false
        break
    }
}

if (-not $allExist) {
    Write-Host "증빙 파일 누락! 전체 실패 처리."
    Remove-Item -Recurse -Force $evidenceDir
    # Slack/Email 알림 로직 추가
    exit 1
}

# manifest.json 생성
$manifest = @{
    created_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss KST")
    db_schema_version = "v1.2.3" # 실제 쿼리로 자동화
    git_commit_hash = "3f2b1c..." # 실제 git log로 자동화
    executed_by = $env:USERNAME
    files = @{}
    file_count = $files.Count
    row_count_summary = @{}
}
foreach ($f in $files) {
    $manifest.files[$f] = Get-FileSHA256("$evidenceDir/$f")
    # row count는 CSV/로그에서 자동 추출
    $manifest.row_count_summary[$f] = "(row count 자동화)"
}

$manifest | ConvertTo-Json | Out-File $manifestPath -Encoding UTF8

Write-Host "모든 증빙 파일 및 manifest.json 생성 완료."