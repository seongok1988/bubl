<#
Update GitHub repository secrets using the `gh` CLI.

Requirements:
- `gh` (GitHub CLI) installed and authenticated
- Provide repository in `owner/repo` format via REPO environment variable or prompt
- .env.local present; this script will read keys from it

Usage:
  $Env:REPO = 'owner/repo'
  gh auth login   # if not already authenticated
  pwsh .\scripts\update_github_secrets.ps1

This will set the following secrets in the repository:
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_KAKAO_REST_API_KEY
  KAKAO_REST_API_KEY
#>

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI not found. Install GitHub CLI and authenticate (gh auth login)."
  exit 1
}

if (-not (Test-Path -Path .env.local)) {
  Write-Error ".env.local not found in current directory. Create it first."
  exit 1
}

$repo = $Env:REPO
if (-not $repo) {
  $repo = Read-Host "Enter GitHub repo (owner/repo)"
}

function Parse-EnvFile($path) {
  $pairs = @{}
  Get-Content $path | ForEach-Object {
    $_ = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($_) -or $_.StartsWith('#')) { return }
    $idx = $_.IndexOf('=')
    if ($idx -lt 0) { return }
    $k = $_.Substring(0,$idx).Trim()
    $v = $_.Substring($idx+1).Trim()
    $pairs[$k] = $v
  }
  return $pairs
}

$envs = Parse-EnvFile .env.local
$secrets = @('NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_KAKAO_REST_API_KEY','KAKAO_REST_API_KEY')

foreach ($s in $secrets) {
  if (-not $envs.ContainsKey($s)) { continue }
  $val = $envs[$s]
  Write-Output "Setting GitHub secret $s..."
  gh secret set $s --body $val --repo $repo
}

Write-Output "GitHub secrets updated. Trigger workflows or push to redeploy as needed."
