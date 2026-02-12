-- false_positive 집계 뷰
CREATE MATERIALIZED VIEW IF NOT EXISTS false_positive_view AS
SELECT
    COUNT(*) AS total_test_events,
    COUNT(*) FILTER (WHERE alert_type IS NOT NULL) AS total_alerts,
    COUNT(*) FILTER (WHERE valid_alert = TRUE) AS valid_alerts,
    COUNT(*) FILTER (WHERE false_positive = TRUE) AS false_alerts,
    ROUND(100.0 * COUNT(*) FILTER (WHERE false_positive = TRUE) / NULLIF(COUNT(*) FILTER (WHERE alert_type IS NOT NULL),0), 2) AS false_positive_rate,
    ROUND(COUNT(*) FILTER (WHERE alert_type IS NOT NULL) / 24.0, 2) AS alert_per_hour
FROM alert_history;