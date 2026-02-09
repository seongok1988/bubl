#!/usr/bin/env bash
# Apply RLS policies to the connected Postgres database.
# Usage (option A): paste the contents of db/rls_policies.sql into Supabase SQL editor and run.
# Usage (option B): with psql:
#   psql "postgresql://<db_user>:<db_password>@<host>:<port>/<db_name>" -f db/rls_policies.sql

set -euo pipefail

if [ -z "${PSQL_CONN:-}" ]; then
  echo "Set PSQL_CONN environment variable to a valid connection string e.g."
  echo "export PSQL_CONN=\"postgresql://user:pass@host:5432/dbname\""
  exit 1
fi

psql "$PSQL_CONN" -f db/rls_policies.sql
echo "RLS policies applied. Verify in Supabase dashboard."
