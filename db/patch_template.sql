-- 운영 DB 패치 표준 템플릿
SET lock_timeout = '5s';
SET statement_timeout = '30s';

-- 컬럼 추가 예시
ALTER TABLE landlord_reports
ADD COLUMN IF NOT EXISTS risk_flag boolean DEFAULT false;

-- 트리거 안전 패치 예시
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_report_count_trigger'
  ) THEN
    CREATE TRIGGER update_report_count_trigger
    AFTER INSERT ON review_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_report_count();
  END IF;
END$$;

-- ENUM 안전 패치 예시
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'review_status'
    AND e.enumlabel = 'hidden'
  ) THEN
    ALTER TYPE review_status ADD VALUE 'hidden';
  END IF;
END$$;

-- MATERIALIZED VIEW 안전 패치 예시
CREATE UNIQUE INDEX IF NOT EXISTS landlord_scores_mv_uidx ON landlord_scores_mv (landlord_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY landlord_scores_mv;
