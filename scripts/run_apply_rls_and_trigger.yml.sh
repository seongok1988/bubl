#!/usr/bin/env bash
# Helper script to commit workflow, push, set PSQL_CONN secret and trigger the GitHub Actions workflow.
# Requires: git, gh (GitHub CLI) authenticated, bash (Git Bash/WSL)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Working directory: $ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "git not found. Install git and retry." >&2
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) not found. Install from https://cli.github.com/ and authenticate (gh auth login)." >&2
  exit 1
fi

echo "The script will:
  1) commit and push the workflow file (.github/workflows/apply_rls.yml)
  2) optionally set the repository secret PSQL_CONN (you will be prompted or can set PSQL_CONN env)
  3) trigger the Apply Supabase RLS workflow"

read -p "Proceed? [y/N] " proceed
if [[ "$proceed" != "y" && "$proceed" != "Y" ]]; then
  echo "Aborted by user."
  exit 0
fi

# Commit and push workflow file only
echo "Staging workflow file..."
git add .github/workflows/apply_rls.yml || true

if git diff --cached --quiet; then
  echo "No staged changes to commit for workflow file. Skipping commit."
else
  git commit -m "Add workflow to apply Supabase RLS" || true
fi

echo "Pushing current branch to origin..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"

echo "Ensure repository secret PSQL_CONN is set. You can either export PSQL_CONN env or enter it now."
if [[ -z "${PSQL_CONN-}" ]]; then
  read -s -p "Enter PSQL_CONN (postgres://... ) and press Enter (input hidden): " INPUT_CONN
  echo
  PSQL_CONN_VALUE="$INPUT_CONN"
else
  PSQL_CONN_VALUE="$PSQL_CONN"
fi

if [[ -z "$PSQL_CONN_VALUE" ]]; then
  echo "No PSQL_CONN provided; skipping secret update. If secret exists in repo, workflow can still run." 
else
  echo "Setting repository secret PSQL_CONN via gh..."
  echo "$PSQL_CONN_VALUE" | gh secret set PSQL_CONN
fi

echo "Triggering workflow 'apply_rls.yml'..."
gh workflow run apply_rls.yml --ref "$BRANCH"

echo "Workflow triggered. Use 'gh run list' and 'gh run view <id> --log' to inspect logs, or open Actions in GitHub UI." 

echo "Done."
