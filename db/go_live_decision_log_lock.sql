-- go_live_decision_log UPDATE/DELETE 금지 트리거
CREATE OR REPLACE FUNCTION lock_decision_log()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'go_live_decision_log은 불변 기록입니다. 수정/삭제 금지.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lock_decision_log_update
BEFORE UPDATE ON go_live_decision_log
FOR EACH ROW EXECUTE FUNCTION lock_decision_log();

CREATE TRIGGER lock_decision_log_delete
BEFORE DELETE ON go_live_decision_log
FOR EACH ROW EXECUTE FUNCTION lock_decision_log();