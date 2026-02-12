-- alerts 테이블 및 breach 자동화
CREATE TYPE alert_status_enum AS ENUM ('pending', 'acknowledged', 'resolved', 'breached');

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    breach_at TIMESTAMP,
    auto_breach_flag BOOLEAN DEFAULT FALSE,
    status alert_status_enum DEFAULT 'pending'
);

-- 30분 초과 자동 breach 트리거
CREATE OR REPLACE FUNCTION auto_breach_alert()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'pending' AND (NOW() - NEW.created_at) > INTERVAL '30 minutes' THEN
        NEW.status := 'breached';
        NEW.breach_at := NOW();
        NEW.auto_breach_flag := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER breach_alert_trigger
BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION auto_breach_alert();