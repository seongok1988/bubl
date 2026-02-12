-- 임대인 반론 테이블
CREATE TABLE IF NOT EXISTS landlord_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES landlord_reports(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES users(id),
  reply_text text,
  status report_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid
);
