Security: server-side posts API, RLS policies, and environment cleanup

This PR includes:

- Server-side `posts` API endpoints under `pages/api/posts` (GET/POST/PUT/DELETE) which verify client JWTs and perform writes using the Supabase service role key.
- Client helpers in `lib/api/post.ts` updated to call the server endpoints instead of writing directly to Supabase.
- RLS SQL (`db/rls_policies.sql`) and an apply helper script (`db/apply_rls.sh`), plus `README_RLS.md` with simple instructions for non-developers.
- `.env.example`, `SECURITY_GUIDE.md`, and `DEPLOY_CHECKLIST.md` documenting secure deployment and env requirements.

Checklist:

- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` and `KAKAO_REST_API_KEY` are set as server-only env vars in Vercel.
- [ ] Apply RLS policies in Supabase (see `README_RLS.md`).
- [ ] Run local smoke test: login, create post, verify `user_id` in Supabase.

If anything needs splitting into separate PRs (e.g., docs vs code), let me know and I can split this into smaller changes.
