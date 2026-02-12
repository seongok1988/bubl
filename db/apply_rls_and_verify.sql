
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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


-- landlord_reports: 구조화된 평판 리포트 테이블
CREATE TABLE IF NOT EXISTS landlord_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES users(id), -- 임대인 FK
  author_id uuid NOT NULL, -- 작성자
    positive_traits text[] DEFAULT '{}', -- 긍정 감정 표현
    negative_traits text[] DEFAULT '{}', -- 부정 감정 표현
  rating integer, -- 평점
  status text, -- 신고/비공개/공개 등 상태
  ip_address text, -- 작성자 IP
  report_count integer DEFAULT 0, -- 신고/수정 횟수
  moderated_by uuid, -- 관리자 ID
  moderated_at timestamptz, -- 관리자 처리 시각
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security for landlord_reports
ALTER TABLE IF EXISTS landlord_reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책 예시
-- 작성자 본인 조회
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Author can view own reports' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Author can view own reports" ON landlord_reports FOR SELECT USING (auth.uid() = author_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Landlord can view reports about them' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Landlord can view reports about them" ON landlord_reports FOR SELECT USING (auth.uid() = landlord_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active reports' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Public can view active reports" ON landlord_reports FOR SELECT USING (status = 'active');$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Authenticated users can insert" ON landlord_reports FOR INSERT WITH CHECK (auth.uid() = author_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Author can update own report' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Author can update own report" ON landlord_reports FOR UPDATE USING (auth.uid() = author_id);$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Author can delete own report' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Author can delete own report" ON landlord_reports FOR DELETE USING (auth.uid() = author_id);$pol$;
  END IF;
END
$$;

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



-- 집계 테이블: landlord_rating_summary
CREATE TABLE IF NOT EXISTS landlord_rating_summary (
  landlord_id uuid PRIMARY KEY,
  avg_rating numeric(2,1),
  total_reviews integer DEFAULT 0,
  positive_count integer DEFAULT 0,
  negative_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 집계 트리거 함수
CREATE OR REPLACE FUNCTION update_landlord_rating_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO landlord_rating_summary (
    landlord_id,
    avg_rating,
    total_reviews,
    positive_count,
    negative_count
  )
  SELECT
    landlord_id,
    AVG(rating),
    COUNT(*),
    SUM(jsonb_array_length(positive_traits)),
    SUM(jsonb_array_length(negative_traits))
  FROM landlord_reports
  WHERE landlord_id = NEW.landlord_id
    AND status = 'approved'
  GROUP BY landlord_id
  ON CONFLICT (landlord_id)
  DO UPDATE SET
    avg_rating = EXCLUDED.avg_rating,
    total_reviews = EXCLUDED.total_reviews,
    positive_count = EXCLUDED.positive_count,
    negative_count = EXCLUDED.negative_count,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 집계 트리거 연결
CREATE TRIGGER landlord_rating_summary_trigger
AFTER INSERT OR UPDATE ON landlord_reports
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION update_landlord_rating_summary();

-- 신고 테이블: landlord_report_flags
CREATE TABLE IF NOT EXISTS landlord_report_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES landlord_reports(id),
  reporter_id uuid,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- 변경 이력 테이블: landlord_report_history
CREATE TABLE IF NOT EXISTS landlord_report_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid,
  old_data jsonb,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid
);

-- BEFORE UPDATE 트리거 함수: 변경 이력 저장
CREATE OR REPLACE FUNCTION insert_landlord_report_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO landlord_report_history (report_id, old_data, changed_at, changed_by)
  VALUES (OLD.id, to_jsonb(OLD), now(), auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
CREATE TRIGGER landlord_report_history_trigger
BEFORE UPDATE ON landlord_reports
FOR EACH ROW
EXECUTE FUNCTION insert_landlord_report_history();

CREATE INDEX IF NOT EXISTS idx_landlord_reports_landlord_id ON landlord_reports(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_reports_status ON landlord_reports(status);
CREATE INDEX IF NOT EXISTS idx_landlord_reports_author_id ON landlord_reports(author_id);


ALTER TABLE landlord_reports
ADD CONSTRAINT rating_range_check
CHECK (rating BETWEEN 1 AND 5);

-- author_id FK 연결
ALTER TABLE landlord_reports
ADD CONSTRAINT fk_author
FOREIGN KEY (author_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- status ENUM 타입 전환
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE report_status AS ENUM ('pending','approved','hidden','rejected');
  END IF;
END$$;
ALTER TABLE landlord_reports
ALTER COLUMN status TYPE report_status
USING status::report_status;

-- updated_at 자동 갱신 트리거
ALTER TABLE landlord_reports ADD COLUMN IF NOT EXISTS updated_at timestamptz;
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at_trigger
BEFORE UPDATE ON landlord_reports
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE landlord_reports ADD COLUMN IF NOT EXISTS lease_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS landlord_reports_lease_id_unique ON landlord_reports(lease_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reviewer_type') THEN
    CREATE TYPE reviewer_type AS ENUM ('verified_tenant','visitor','agent','general');
  END IF;
END$$;
ALTER TABLE landlord_reports ADD COLUMN IF NOT EXISTS reviewer_type reviewer_type;

-- is_verified 구조 추가 (계약 인증 여부)
ALTER TABLE landlord_reports ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- needs_review 위험 키워드 자동 플래그
ALTER TABLE landlord_reports ADD COLUMN IF NOT EXISTS needs_review boolean DEFAULT false;

-- 위험 키워드 트리거 (사기, 고소, 범죄, 탈세, 폭행 등)
CREATE OR REPLACE FUNCTION flag_needs_review()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    position('사기' in coalesce(NEW.positive_traits::text,'') || coalesce(NEW.negative_traits::text,'')) > 0 OR
    position('고소' in coalesce(NEW.positive_traits::text,'') || coalesce(NEW.negative_traits::text,'')) > 0 OR
    position('범죄' in coalesce(NEW.positive_traits::text,'') || coalesce(NEW.negative_traits::text,'')) > 0 OR
    position('탈세' in coalesce(NEW.positive_traits::text,'') || coalesce(NEW.negative_traits::text,'')) > 0 OR
    position('폭행' in coalesce(NEW.positive_traits::text,'') || coalesce(NEW.negative_traits::text,'')) > 0
  ) THEN
    NEW.needs_review := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER flag_needs_review_trigger
BEFORE INSERT OR UPDATE ON landlord_reports
FOR EACH ROW
EXECUTE FUNCTION flag_needs_review();

-- status 플로우: pending → approved(관리자 승인) → hidden(신고/법적 리스크)
-- 관리자 승인 플로우는 UI/API에서 구현

-- 신고 자동 hidden 트리거 이미 구현됨

-- 신뢰도 점수 기반 정렬 알고리즘 예시
-- SELECT *, (CASE reviewer_type WHEN 'verified_tenant' THEN 1.0 WHEN 'agent' THEN 0.8 WHEN 'visitor' THEN 0.6 WHEN 'general' THEN 0.4 END * rating + upvotes - flags) AS score
FROM landlord_reports
ORDER BY score DESC, created_at DESC;

-- tenant 타입은 lease_id 필수 (CHECK 제약)
ALTER TABLE landlord_reports DROP CONSTRAINT IF EXISTS tenant_leaseid_check;
ALTER TABLE landlord_reports ADD CONSTRAINT tenant_leaseid_check CHECK (
  (reviewer_type = 'tenant' AND lease_id IS NOT NULL)
  OR (reviewer_type <> 'tenant')
);

-- reviewer_type별 평점 가중치 집계(향후 확장 가능)
-- 예시: tenant=1.0, agent=0.8, visitor=0.6, other=0.5
-- 실제 집계는 뷰/쿼리/트리거 등에서 활용

-- 신고 3회 자동 hidden 처리 트리거
CREATE OR REPLACE FUNCTION hide_report_on_flags()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM landlord_report_flags WHERE report_id = NEW.report_id) >= 3 THEN
    UPDATE landlord_reports SET status = 'hidden' WHERE id = NEW.report_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER hide_report_on_flags_trigger
AFTER INSERT ON landlord_report_flags
FOR EACH ROW
EXECUTE FUNCTION hide_report_on_flags();

-- status 기본값 설정
ALTER TABLE landlord_reports
ALTER COLUMN status SET DEFAULT 'pending';

-- users 테이블에 role 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 관리자 전체 접근 정책
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all reports' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Admin can view all reports" ON landlord_reports FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    );$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update all reports' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Admin can update all reports" ON landlord_reports FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    );$pol$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can delete all reports' AND tablename = 'landlord_reports') THEN
    EXECUTE $pol$CREATE POLICY "Admin can delete all reports" ON landlord_reports FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      )
    );$pol$;
  END IF;
END
$$;

-- 2) RLS status
-- SELECT relname AS table_name, relrowsecurity AS rls_enabled, pg_get_userbyid(c.relowner) AS owner
-- FROM pg_class c WHERE c.relname IN ('posts','comments');

-- 3) quick smoke: try inserting a sample post as the DB owner (works for verification only)
-- INSERT INTO posts (user_id, title, body) VALUES (gen_random_uuid(), 'smoke', 'smoke body');

-- Note: For production, don't insert owner-user test rows; instead test via authenticated app flows.
