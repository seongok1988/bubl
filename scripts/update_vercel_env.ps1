<#
Update Vercel project environment variables from local .env.local.

Requirements:
- PowerShell (Windows)
- Set environment variables: VERCEL_TOKEN, VERCEL_PROJECT_ID
- .env.local present in project root

Usage:
  $Env:VERCEL_TOKEN = '<your-vercel-token>'
  $Env:VERCEL_PROJECT_ID = '<your-project-id>'
  pwsh .\scripts\update_vercel_env.ps1

This script will create or replace the following vars on Vercel for targets
preview and production:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_KAKAO_REST_API_KEY
  KAKAO_REST_API_KEY
#>

if (-not (Test-Path -Path .env.local)) {
  Write-Error ".env.local not found in current directory. Create it first."
  exit 1
}

$token = $Env:VERCEL_TOKEN
$projectId = $Env:VERCEL_PROJECT_ID
if (-not $token -or -not $projectId) {
  Write-Error "Set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables before running."
  exit 1
}

# Keys to sync
$keys = @(
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_KAKAO_REST_API_KEY',
  'KAKAO_REST_API_KEY'
)

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

foreach ($k in $keys) {
  if (-not $envs.ContainsKey($k)) { continue }
  $value = $envs[$k]
  Write-Output "Syncing $k to Vercel..."

  # Check existing envs
  $listUrl = "https://api.vercel.com/v9/projects/$projectId/env"
  $existing = Invoke-RestMethod -Method Get -Uri $listUrl -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
  $found = $existing.env | Where-Object { $_.key -eq $k }
  if ($found) {
    foreach ($f in $found) {
      $delUrl = "https://api.vercel.com/v9/projects/$projectId/env/$($f.id)"
      Invoke-RestMethod -Method Delete -Uri $delUrl -Headers @{ Authorization = "Bearer $token" } -ErrorAction SilentlyContinue
    }
  }

  $body = @{ key = $k; value = $value; target = @('preview','production'); type = 'encrypted' } | ConvertTo-Json
  $createUrl = "https://api.vercel.com/v9/projects/$projectId/env"
  Invoke-RestMethod -Method Post -Uri $createUrl -Headers @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' } -Body $body -ErrorAction Stop
  Write-Output "  -> $k updated"
}

Write-Output "All done. Trigger a redeploy in Vercel dashboard or run 'vercel --prod' to pick up new envs." 
