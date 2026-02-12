-- admin_logs 테이블: 모든 관리자 액션 기록
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_review_id uuid,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz DEFAULT now()
);
