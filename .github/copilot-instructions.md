# Copilot instructions for the bubl repository

This file provides concise, repository-specific guidance so AI coding agents can be immediately productive.

1. Big picture
- This is a Next.js (app router) frontend in `app/` with legacy API routes under `pages/api/`.
- Core integrations: Supabase (DB/auth) and Kakao Local API (address search).
- Supabase client is initialized in [lib/supabase.ts](lib/supabase.ts) and used across `lib/api/*` and server routes.

2. Important scripts
- Development: `npm run dev` (uses `next dev`). See `package.json` scripts.
- Build: `npm run build`, Start: `npm start`, Lint: `npm run lint`.

3. Environment & secrets
- Required env vars (set in `.env.local` or hosting provider):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_KAKAO_REST_API_KEY` (used by server API in `pages/api/kakao-address.ts`)
- Do NOT hardcode keys in frontend components. Example: `components/KakaoAddressSearch.tsx` currently contains a hardcoded `KAKAO_REST_API_KEY` constant — prefer calling the server API route instead.

4. Patterns & conventions
- UI: Functional React components with Tailwind CSS classes (see `components/`).
- Data flow: Client UI -> server API (`pages/api/*`) -> Supabase (via `lib/supabase.ts`) or external APIs (Kakao).
- When creating server code that uses Supabase, import the shared client: `import { supabase } from "lib/supabase"` (see [lib/supabase.ts](lib/supabase.ts)).
- Address search: frontend calls `/api/kakao-address?query=...` (see [components/KakaoAddressSearch.tsx](components/KakaoAddressSearch.tsx) and [pages/api/kakao-address.ts](pages/api/kakao-address.ts)).

5. File/Folder responsibilities
- `app/` — Next.js app routes and UI.
- `components/` — Reusable UI components; prefer small, stateless props where possible (many components expose `onSelect` callbacks).
- `lib/` — Shared clients and API helpers (Supabase client lives here).
- `pages/api/` — Server-side API endpoints (legacy pages API used for server functions like Kakao proxy).

6. Quick examples
- Create a new server endpoint that queries Supabase:
  - File: `pages/api/my-endpoint.ts`
  - Use: `import { supabase } from "lib/supabase"`

7. Known quirks to watch for
- Coexistence of `app/` (app router) and `pages/api/` (API routes). Prefer server components in `app/` for UI, but keep API logic in `pages/api/` when it must be called from client code.
- Check `README.md` for Supabase setup steps and table references (e.g., `landlord_reports`).

8. When editing and testing
- Run `npm install` then `npm run dev` and open `http://localhost:3000`.
- To test Kakao address search locally, ensure `NEXT_PUBLIC_KAKAO_REST_API_KEY` is set and use the UI in the Search section which calls `/api/kakao-address`.

9. Community features & moderation (project-specific)
- This repository implements an anonymous/semi-anonymous community. Key files: `components/PostForm.tsx`, `lib/api/post.ts`, `components/CommentList.tsx`, `components/CommunitySection.tsx`.
- Pattern: many client components call helper functions in `lib/api/*` which use the shared `supabase` client (anon key). This means most CRUD happens from the client — enforce server-side constraints (RLS) in the database.
- Moderation suggestions:
  - Enforce server-side RLS policies on `posts`, `comments`, `users` tables so clients cannot spoof `user_id` or escalate roles.
  - Add a `status` or `is_hidden` column for moderation actions instead of deleting immediately.
  - Provide admin-only API endpoints under `pages/api/admin/*` that run with a service role key kept in env (never commit). Use these only for moderation tasks requiring elevated privileges.

10. Security considerations (concrete, code-focused)
- Secrets: remove hardcoded keys. Example to fix: `components/KakaoAddressSearch.tsx` defines `KAKAO_REST_API_KEY` inline — move this to server-only env var (e.g., `KAKAO_REST_API_KEY`) and call `/api/kakao-address` which uses `process.env.KAKAO_REST_API_KEY`.
- Env var conventions: use `NEXT_PUBLIC_*` only for values safe to expose to browsers. Keep service or admin keys out of `NEXT_PUBLIC_`.
- Authorization & RLS:
  - Ensure Postgres RLS policies check `auth.uid()` or session information so that `createPost`, `updatePost`, `deletePost` cannot be abused by clients.
  - When client code (e.g., `lib/api/post.ts`) performs checks client-side, replicate/verify those checks in DB policies or server API handlers.
- Input validation & XSS:
  - Sanitize or limit HTML in user content; prefer storing plain text and render safely. Avoid `dangerouslySetInnerHTML` unless content is sanitized.
  - Validate lengths and allowed characters in `createPost`/`createComment` before inserting.
- Rate limiting & abuse protection:
  - Add simple rate limits in API routes (e.g., per-IP or per-user counters) to prevent spam from the address-search API and community endpoints.
  - Consider using a lightweight in-memory store (Redis) or edge provider features for production rate limiting.
- Audit & logging:
  - Log moderation actions and failed auth attempts via server API endpoints (do not log secrets).

11. Immediate fixes & PR tasks (high impact)
- Replace hardcoded Kakao key in `components/KakaoAddressSearch.tsx` with a call to `pages/api/kakao-address` (already present) and remove the constant.
- Add an `.env.example` documenting required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `KAKAO_REST_API_KEY` (server-only). Commit the example file.
- Add DB RLS policy notes in README or a `SECURITY_GUIDE.md` describing required Postgres policies for `posts`, `comments`, and `users`.

12. Testing, debugging & developer workflows
- Local dev: `npm install`, `npm run dev`, open `http://localhost:3000`.
- To debug auth/permissions locally: create test users in Supabase and validate RLS by trying operations from the client and via `psql`.
- Linting: `npm run lint` — run this before PRs.

13. Safety & PR guidance
- Avoid adding secrets to committed files. If you find hardcoded API keys, create a fix-PR that removes them and moves the key to env vars; include `env.example` updates.
- Keep changes small and focused; this repo follows standard Next.js structure with Tailwind utilities.

If any section is unclear or you want more examples (e.g., exact RLS policy snippets or an `api/admin/moderate.ts` example), tell me which area to expand.

14. Vercel deployment checklist (secure defaults)
- Add the following env vars in Vercel Project Settings (do NOT mark server-only keys as `NEXT_PUBLIC_`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `KAKAO_REST_API_KEY` (server-only)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, only for admin API endpoints)
- Build command: `npm run build`. Output directory: default Next.js (do not change unless you know what you're doing).
- Recommended Vercel settings:
  - Protect admin API routes via middleware or secret tokens.
  - Enable environment variable protection so server-only envs are not exposed to the client.
- Post-deploy checks:
  - Verify `pages/api/kakao-address` returns expected results (Kakao key present).
  - Confirm RLS policies (see `SECURITY_GUIDE.md`) are active and that unauthenticated attempts to create posts are rejected.
  - Run a smoke test: create a user, sign in, create a post via UI and confirm the record appears in Supabase and `user_id` matches the authenticated uid.
