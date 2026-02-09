#!/usr/bin/env bash
set -euo pipefail

BRANCH=feature/server-posts-security
FILES=(
  db/rls_policies.sql
  db/apply_rls.sh
  README_RLS.md
  pages/api/posts
  lib/api/post.ts
  .env.example
  SECURITY_GUIDE.md
  .github/copilot-instructions.md
  DEPLOY_CHECKLIST.md
)

echo "Checking prerequisites..."
if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed or not in PATH. Install git and retry." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) not found. The script will still create branch, commit and push, but PR creation will be manual." >&2
  GH_AVAILABLE=0
else
  GH_AVAILABLE=1
fi

echo "Creating branch $BRANCH"
git fetch origin || true
git checkout -b "$BRANCH"

echo "Staging files..."
for f in "${FILES[@]}"; do
  git add "$f" || true
done

COMMIT_MSG="feat(security): server-side posts API, RLS SQL, docs and env cleanup"
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"

echo "Pushing branch..."
git push -u origin "$BRANCH"

if [ "$GH_AVAILABLE" -eq 1 ]; then
  echo "Creating PR via gh"
  gh pr create --title "$COMMIT_MSG" --body-file .github/PR_BODY.md --base main || gh pr create --title "$COMMIT_MSG" --body "Security: server-side posts API + RLS"
  echo "PR created."
else
  echo "GH CLI not available. Open a PR manually at: https://github.com/<your-repo>/pull/new/$BRANCH"
fi

echo "Done."
