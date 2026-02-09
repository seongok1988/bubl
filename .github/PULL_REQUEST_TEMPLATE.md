<!-- Describe the change and why it is needed -->
### Summary

<!-- Short description -->

### Changes
- Server-side posts API + client updates
- RLS SQL + apply script
- Security & deploy docs

### Security checklist
- [ ] `SUPABASE_SERVICE_ROLE_KEY` and `KAKAO_REST_API_KEY` are set as server-only env vars
- [ ] RLS applied to `posts` and `comments`
- [ ] Smoke-tested: create post as authenticated user

### Notes for reviewers
- This PR touches both server code and docs; prefer reviewing by commit if needed.
