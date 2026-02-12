-- go_live_validation_view: 모든 조건 통합
CREATE VIEW go_live_validation_view AS
SELECT
    'policy_hash_match' AS check_item, (SELECT policy_hash_match FROM policy_hash_check LIMIT 1) AS result, NULL AS value
UNION ALL
SELECT
    'snapshot_hash_match', (SELECT hash_match FROM snapshot_immutable_test LIMIT 1), NULL
UNION ALL
SELECT
    'sla_breach_count', (SELECT sla_breaches FROM sla_monitoring_view LIMIT 1), (SELECT max_response_time FROM sla_monitoring_view LIMIT 1)
UNION ALL
SELECT
    'false_positive_rate', (SELECT false_positive_rate < 5 FROM false_positive_view LIMIT 1), (SELECT false_positive_rate FROM false_positive_view LIMIT 1)
UNION ALL
SELECT
    'alert_per_hour', (SELECT alert_per_hour <= 3 FROM false_positive_view LIMIT 1), (SELECT alert_per_hour FROM false_positive_view LIMIT 1)
UNION ALL
SELECT
    'attack_simulation_passed', (SELECT COUNT(*) >= 3 FROM attack_simulation_result WHERE defense_success), NULL
UNION ALL
SELECT
    'go_live_status',
    CASE
        WHEN (SELECT policy_hash_match FROM policy_hash_check LIMIT 1) = TRUE
         AND (SELECT hash_match FROM snapshot_immutable_test LIMIT 1) = TRUE
         AND (SELECT sla_breaches FROM sla_monitoring_view LIMIT 1) = 0
         AND (SELECT false_positive_rate FROM false_positive_view LIMIT 1) < 5
         AND (SELECT alert_per_hour FROM false_positive_view LIMIT 1) <= 3
         AND (SELECT COUNT(*) FROM attack_simulation_result WHERE defense_success) >= 3
        THEN TRUE ELSE FALSE
    END,
    CASE
        WHEN (SELECT policy_hash_match FROM policy_hash_check LIMIT 1) = TRUE
         AND (SELECT hash_match FROM snapshot_immutable_test LIMIT 1) = TRUE
         AND (SELECT sla_breaches FROM sla_monitoring_view LIMIT 1) = 0
         AND (SELECT false_positive_rate FROM false_positive_view LIMIT 1) < 5
         AND (SELECT alert_per_hour FROM false_positive_view LIMIT 1) <= 3
         AND (SELECT COUNT(*) FROM attack_simulation_result WHERE defense_success) >= 3
        THEN 'APPROVED' ELSE 'REJECTED'
    END;