# How to apply RLS policies (non-developer friendly)

Two simple ways to apply the RLS policies provided in `db/rls_policies.sql`:

1) Supabase SQL Editor (recommended for non-developers)
- Open your Supabase project dashboard > SQL > New Query
- Copy the contents of `db/rls_policies.sql` and paste into the editor
- Click Run

2) Command-line (for developers)
- Ensure you have `psql` installed and a DB connection string
- Set `PSQL_CONN` env var and run:
```
export PSQL_CONN="postgresql://user:pass@host:5432/dbname"
./db/apply_rls.sh
```

After applying:
- Go to Supabase Table Editor and confirm policies exist for `posts` and `comments`.
- Run a smoke test: sign in via UI and attempt to create a post; it should succeed for authenticated users.
