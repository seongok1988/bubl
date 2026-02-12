-- SLA 자동 집계 뷰
CREATE MATERIALIZED VIEW IF NOT EXISTS sla_monitoring_view AS
SELECT
    COUNT(*) AS total_alerts,
    SUM(CASE WHEN EXTRACT(EPOCH FROM (acknowledged_at - sent_at))/60 > 30 OR acknowledged_at IS NULL THEN 1 ELSE 0 END) AS sla_breaches,
    ROUND(100.0 * SUM(CASE WHEN EXTRACT(EPOCH FROM (acknowledged_at - sent_at))/60 > 30 OR acknowledged_at IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS breach_rate,
    ROUND(AVG(EXTRACT(EPOCH FROM (acknowledged_at - sent_at))/60), 2) AS avg_response_time,
    ROUND(MAX(EXTRACT(EPOCH FROM (acknowledged_at - sent_at))/60), 2) AS max_response_time,
    SUM(CASE WHEN escalation_level > 1 THEN 1 ELSE 0 END) AS escalation_count
FROM alert_delivery_logs;