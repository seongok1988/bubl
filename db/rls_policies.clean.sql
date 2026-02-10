ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insert own posts' AND tablename = 'posts') THEN
    EXECUTE $$CREATE POLICY "Insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Select posts' AND tablename = 'posts') THEN
    EXECUTE $$CREATE POLICY "Select posts" ON posts FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Update own posts' AND tablename = 'posts') THEN
    EXECUTE $$CREATE POLICY "Update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delete own posts' AND tablename = 'posts') THEN
    EXECUTE $$CREATE POLICY "Delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);$$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insert own comments' AND tablename = 'comments') THEN
    EXECUTE $$CREATE POLICY "Insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Select comments' AND tablename = 'comments') THEN
    EXECUTE $$CREATE POLICY "Select comments" ON comments FOR SELECT USING (true);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Update own comments' AND tablename = 'comments') THEN
    EXECUTE $$CREATE POLICY "Update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delete own comments' AND tablename = 'comments') THEN
    EXECUTE $$CREATE POLICY "Delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);$$;
  END IF;
END
$$;
