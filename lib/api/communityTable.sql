-- Supabase Table 생성 예시 (SQL)
-- communities 테이블
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 인덱스 (검색 성능 향상)
create index if not exists idx_communities_created_at on public.communities(created_at desc);
