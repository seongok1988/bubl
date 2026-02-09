# DEPLOY_CHECKLIST — Vercel + Supabase (secure)

Follow these steps to deploy the app to Vercel and ensure Supabase writes work and are secure.

1) Setup repository on Vercel
- Import the repository into Vercel and choose the root `c:\bubl` (default import).

2) Add environment variables
- Go to Project Settings > Environment Variables and add:
  - `NEXT_PUBLIC_SUPABASE_URL` = from Supabase Project > API > URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = from Supabase Project > API > anon key
  - `KAKAO_REST_API_KEY` = Kakao REST API key (server-only)
  - `SUPABASE_SERVICE_ROLE_KEY` = (optional, server-only) for admin endpoints

3) Build & Start
- Build command: `npm run build`
- Start: Vercel will handle static/SSR routes automatically.

4) Verify Supabase persistence
- Create a test user and sign in via the UI.
- Using the UI, create a post/comment; confirm the row exists in Supabase with the correct `user_id`.
- If client-side helpers insert `user_id` directly (see `lib/api/post.ts`), ensure RLS policies prevent spoofing (see `SECURITY_GUIDE.md`).

5) Post-deploy security checklist
- Ensure `KAKAO_REST_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are not exposed as `NEXT_PUBLIC_*` in Vercel.
- Confirm RLS policies are enabled and tested for `INSERT/UPDATE/DELETE`.
- Confirm admin endpoints (if any) require an additional secret token or authentication.

6) Optional hardening
- Move client-side direct DB writes to server endpoints if you want stricter control, e.g., `pages/api/posts/*` that validate user sessions server-side.
