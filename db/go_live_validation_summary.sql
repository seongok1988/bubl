-- Go-Live 최종 통합 판단 쿼리
SELECT
    CASE
        WHEN (SELECT sla_breaches FROM sla_monitoring_view) = 0
         AND (SELECT false_positive_rate FROM false_positive_view) < 5
         AND (SELECT alert_per_hour FROM false_positive_view) <= 3
         AND (SELECT COUNT(*) FROM attack_simulation_result WHERE defense_success) >= 3
         AND (SELECT hash_match FROM snapshot_immutable_test WHERE hash_match = TRUE LIMIT 1) = TRUE
         AND (SELECT policy_hash_match FROM policy_hash_check WHERE policy_hash_match = TRUE LIMIT 1) = TRUE
        THEN 'APPROVED'
        ELSE 'PENDING'
    END AS go_live_status;