-- freeze_status 테이블
CREATE TABLE IF NOT EXISTS freeze_status (
    id SERIAL PRIMARY KEY,
    freeze_active BOOLEAN NOT NULL DEFAULT FALSE,
    freeze_start_at TIMESTAMP,
    freeze_end_at TIMESTAMP,
    freeze_reason TEXT
);

-- 정책 변경 트리거 예시
CREATE OR REPLACE FUNCTION check_freeze_status()
RETURNS trigger AS $$
DECLARE
    freeze BOOLEAN;
BEGIN
    SELECT freeze_active INTO freeze FROM freeze_status ORDER BY id DESC LIMIT 1;
    IF freeze THEN
        RAISE EXCEPTION 'Freeze 상태에서 정책 변경 불가';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- reviewer_weights 변경 차단 트리거
CREATE TRIGGER freeze_policy_change
BEFORE UPDATE ON reviewer_weights
FOR EACH ROW EXECUTE FUNCTION check_freeze_status();