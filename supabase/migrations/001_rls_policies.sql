-- ============================================================
-- Bubl RLS (Row Level Security) 정책
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================================

-- 1. comments 테이블
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 누구나 댓글 조회 가능
CREATE POLICY "comments_select_all" ON comments
  FOR SELECT USING (true);

-- 인증된 사용자만 댓글 작성
CREATE POLICY "comments_insert_auth" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 수정
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 삭제
CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 2. posts 테이블
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all" ON posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_auth" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 3. communities 테이블
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communities_select_all" ON communities
  FOR SELECT USING (true);

CREATE POLICY "communities_insert_auth" ON communities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. landlord_reports 테이블
ALTER TABLE landlord_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landlord_reports_select_all" ON landlord_reports
  FOR SELECT USING (true);

CREATE POLICY "landlord_reports_insert_auth" ON landlord_reports
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "landlord_reports_update_own" ON landlord_reports
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 5. surveys 테이블
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_select_all" ON surveys
  FOR SELECT USING (true);

CREATE POLICY "surveys_insert_auth" ON surveys
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. survey_questions 테이블
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_questions_select_all" ON survey_questions
  FOR SELECT USING (true);

-- 7. survey_answers 테이블
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_answers_select_all" ON survey_answers
  FOR SELECT USING (true);

CREATE POLICY "survey_answers_insert_auth" ON survey_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
