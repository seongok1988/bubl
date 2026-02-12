-- 동일 alert 유형 15분 내 1회로 묶기 (rolling aggregation)
CREATE MATERIALIZED VIEW IF NOT EXISTS alert_rolling_summary AS
SELECT alert_type, MIN(alert_created_at) AS first_alert,
    MAX(alert_created_at) AS last_alert,
    COUNT(*) AS alert_count
FROM alert_queue
WHERE alert_created_at > NOW() - INTERVAL '15 minutes'
GROUP BY alert_type;

-- summary + delta 방식 메일 발송 예시
-- 실제 메일 발송 로직은 backend에서 구현