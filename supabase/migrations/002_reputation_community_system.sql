-- ============================================================
-- Bubl 평판/신고/커뮤니티 시스템 DB 스키마
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 기존 DB와 충돌하지 않도록 별도 테이블명(prefix) 사용
-- ============================================================

-- 1. reputation_surveys: 평판 제보 설문
CREATE TABLE IF NOT EXISTS reputation_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  address text NOT NULL,
  landlord_name text,
  rating numeric,
  review_content text NOT NULL,
  evaluation jsonb,
  keywords text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blind', 'deleted')),
  legal_agreement boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. reputation_evaluation_scores: 설문 평가 항목 점수
CREATE TABLE IF NOT EXISTS reputation_evaluation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES reputation_surveys(id) ON DELETE CASCADE,
  negotiation_flexibility numeric NOT NULL DEFAULT 0,
  renewal_manners numeric NOT NULL DEFAULT 0,
  interference_index numeric NOT NULL DEFAULT 0,
  maintenance_cooperation numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. review_reports: 리뷰/설문 신고 내역
CREATE TABLE IF NOT EXISTS review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id),
  target_survey_id uuid REFERENCES reputation_surveys(id),
  target_review_id text,
  reason text NOT NULL CHECK (reason IN ('defamation', 'privacy', 'profanity', 'other')),
  detail text,
  attachment_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. community_posts: 커뮤니티 게시글
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT '경험담' CHECK (category IN ('경험담', '질문', '주의사항')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blind', 'deleted')),
  likes integer NOT NULL DEFAULT 0,
  dislikes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. community_comments: 커뮤니티 댓글 (무한 대댓글)
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  parent_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_secret boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  likes integer NOT NULL DEFAULT 0,
  dislikes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. community_reports: 커뮤니티 게시글 신고
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id),
  post_id uuid NOT NULL REFERENCES community_posts(id),
  reason text NOT NULL CHECK (reason IN ('defamation', 'privacy', 'profanity', 'other')),
  detail text,
  attachment_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. notifications: 알림
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('comment', 'report', 'admin', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. admin_logs: 관리자 조치 기록
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('blind', 'unblind', 'delete', 'edit', 'dismiss')),
  target_type text NOT NULL CHECK (target_type IN ('survey', 'post', 'comment', 'report')),
  target_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. legal_logs: 법적 면책 동의 기록
CREATE TABLE IF NOT EXISTS legal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  survey_id uuid REFERENCES reputation_surveys(id),
  agreed boolean NOT NULL DEFAULT true,
  disclaimer_text text NOT NULL,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. community_votes: 좋아요/싫어요 중복 방지
CREATE TABLE IF NOT EXISTS community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- 11. user_profiles: 사용자 프로필 (닉네임, 탈퇴 상태)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  nickname text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS 정책
-- ============================================================

-- reputation_surveys
ALTER TABLE reputation_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surveys_select_active" ON reputation_surveys FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "surveys_insert_auth" ON reputation_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "surveys_update_own" ON reputation_surveys FOR UPDATE USING (auth.uid() = user_id);

-- review_reports
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_own" ON review_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "reports_insert_auth" ON review_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cposts_select_active" ON community_posts FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "cposts_insert_auth" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cposts_update_own" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cposts_delete_own" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccomments_select_all" ON community_comments FOR SELECT USING (true);
CREATE POLICY "ccomments_insert_auth" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ccomments_update_own" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ccomments_delete_own" ON community_comments FOR DELETE USING (auth.uid() = user_id);

-- community_reports
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creports_select_own" ON community_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "creports_insert_auth" ON community_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- community_votes
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_own" ON community_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "votes_insert_auth" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete_own" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- legal_logs
ALTER TABLE legal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_select_own" ON legal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "legal_insert_auth" ON legal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- indexes
CREATE INDEX IF NOT EXISTS idx_cposts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_cposts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_cposts_likes ON community_posts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_ccomments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_ccomments_parent ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_rsurveys_address ON reputation_surveys(address);
CREATE INDEX IF NOT EXISTS idx_rsurveys_status ON reputation_surveys(status);
