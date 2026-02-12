-- alert_delivery_logs 테이블 구조
CREATE TABLE IF NOT EXISTS alert_delivery_logs (
    alert_id TEXT NOT NULL,
    recipient TEXT NOT NULL,
    smtp_response_code TEXT,
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    retry_count INT DEFAULT 0,
    escalation_level INT DEFAULT 1
);

-- SLA 자동 위반 감지 쿼리 예시
SELECT alert_id, recipient, sent_at, acknowledged_at,
    EXTRACT(EPOCH FROM (acknowledged_at - sent_at))/60 AS ack_minutes,
    CASE
        WHEN acknowledged_at IS NULL AND EXTRACT(EPOCH FROM (NOW() - sent_at))/60 > 30 THEN '1차 escalation'
        WHEN acknowledged_at IS NULL AND EXTRACT(EPOCH FROM (NOW() - sent_at))/60 > 60 THEN '2차 escalation'
        WHEN acknowledged_at IS NULL AND EXTRACT(EPOCH FROM (NOW() - sent_at))/60 > 120 THEN '대표 escalation'
        ELSE '정상'
    END AS sla_status
FROM alert_delivery_logs;