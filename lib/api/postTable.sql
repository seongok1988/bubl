-- 게시글(posts) 테이블
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 댓글(comments) 테이블
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid,
  content text not null,
  is_secret boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 설문지(surveys) 테이블
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 설문 문항(survey_questions) 테이블
create table if not exists public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys(id) on delete cascade,
  question text not null
);

-- 설문 응답(survey_answers) 테이블
create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys(id) on delete cascade,
  question_id uuid references public.survey_questions(id) on delete cascade,
  user_id uuid,
  answer text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
