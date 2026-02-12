-- 관리자 감사 로그 테이블
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz DEFAULT now()
);
