-- 승인 시점 불변 기록 예시
INSERT INTO go_live_decision_log (
    snapshot_id, decision_at, decision_hash, decision_result, validation_metrics_dump, immutable_flag, approved_by
) VALUES (
    1, NOW(), 'abc123hash', 'APPROVED', '{"sla_breach_count":0,"false_positive_rate":3.2,"alert_per_hour":2,"attack_simulation_passed":true,"policy_hash_match":true,"snapshot_hash_match":true}', TRUE, 'system'
);