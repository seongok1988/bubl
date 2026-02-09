-- RLS policies for posts and comments
-- Run these in Supabase SQL editor or via psql connected to your DB

-- Enable RLS
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

-- Posts: users may insert only if auth.uid() == user_id
CREATE POLICY IF NOT EXISTS "Insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Select posts" ON posts
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: same pattern
CREATE POLICY IF NOT EXISTS "Insert own comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Select comments" ON comments
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: restrict direct inserts that omit required fields
-- (These can be enforced via DB constraints or triggers as needed)
