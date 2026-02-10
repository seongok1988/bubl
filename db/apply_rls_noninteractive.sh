#!/usr/bin/env bash
set -euo pipefail

if [ -z "${PSQL_CONN:-}" ]; then
  echo "PSQL_CONN environment variable is required."
  echo "Usage: PSQL_CONN=\"postgresql://user:pass@host:5432/dbname\" $0"
  exit 1
fi

echo "Applying RLS policies from db/rls_policies.clean.sql..."
psql "$PSQL_CONN" -f db/rls_policies.clean.sql
echo "RLS policies applied. Verifying..."
psql "$PSQL_CONN" -c "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('posts','comments');"

echo "Done."
