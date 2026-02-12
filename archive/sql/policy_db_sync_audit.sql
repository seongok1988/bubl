-- 정책–DB 일치성 검증 SQL 스크립트

-- soft delete 구조 및 실제 DELETE 금지 RLS
SELECT column_name FROM information_schema.columns WHERE table_name = 'landlord_reports' AND column_name = 'status';
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'landlord_reports' AND policyname LIKE '%delete%';

-- rating 수동 수정 차단 트리거
SELECT tgname FROM pg_trigger WHERE tgrelid = 'landlord_reports'::regclass AND tgname LIKE '%rating%';

-- admin_audit_logs 자동 기록 트리거
SELECT tgname FROM pg_trigger WHERE tgrelid = 'admin_audit_logs'::regclass;

-- 동일 IP 감점 로직
SELECT column_name FROM information_schema.columns WHERE table_name = 'landlord_reports' AND column_name = 'ip_address';
-- 감점 로직 함수 존재 여부
SELECT proname FROM pg_proc WHERE proname LIKE '%ip_penalty%';

-- SLA 기준 타임스탬프 기록 필드
SELECT column_name FROM information_schema.columns WHERE table_name = 'landlord_reports' AND column_name IN ('created_at','updated_at');
