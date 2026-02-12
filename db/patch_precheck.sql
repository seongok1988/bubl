-- 패치 실행 전 사전 점검 자동화
-- landlord_reports 컬럼 확인
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'landlord_reports';

-- ENUM 사용 여부 확인
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'review_status';

-- 트리거 존재 확인
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'review_reports'::regclass;
