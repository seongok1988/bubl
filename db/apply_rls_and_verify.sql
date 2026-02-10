-- Integrated script: create tables, enable RLS, create policies, and verify
-- Usage: paste into Supabase SQL Editor and RUN, or run locally with psql -f

-- Ensure extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sample tables if they do not exist
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on targets
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

-- Create policies for `posts` (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insert own posts' AND tablename = 'posts') THEN
    EXECUTE $pol$CREATE POLICY "Insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Select posts' AND tablename = 'posts') THEN
    EXECUTE $pol$CREATE POLICY "Select posts" ON posts FOR SELECT USING (true);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Update own posts' AND tablename = 'posts') THEN
    EXECUTE $pol$CREATE POLICY "Update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delete own posts' AND tablename = 'posts') THEN
    EXECUTE $pol$CREATE POLICY "Delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);$pol$;
  END IF;
END
$$;

-- Create policies for `comments` (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insert own comments' AND tablename = 'comments') THEN
    EXECUTE $pol$CREATE POLICY "Insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Select comments' AND tablename = 'comments') THEN
    EXECUTE $pol$CREATE POLICY "Select comments" ON comments FOR SELECT USING (true);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Update own comments' AND tablename = 'comments') THEN
    EXECUTE $pol$CREATE POLICY "Update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delete own comments' AND tablename = 'comments') THEN
    EXECUTE $pol$CREATE POLICY "Delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);$pol$;
  END IF;
END
$$;

-- Verification queries: run these after the script to confirm
-- 1) policy list
-- SELECT policyname, schemaname, tablename FROM pg_policies WHERE tablename IN ('posts','comments');

-- 2) RLS status
-- SELECT relname AS table_name, relrowsecurity AS rls_enabled, pg_get_userbyid(c.relowner) AS owner
-- FROM pg_class c WHERE c.relname IN ('posts','comments');

-- 3) quick smoke: try inserting a sample post as the DB owner (works for verification only)
-- INSERT INTO posts (user_id, title, body) VALUES (gen_random_uuid(), 'smoke', 'smoke body');

-- Note: For production, don't insert owner-user test rows; instead test via authenticated app flows.
