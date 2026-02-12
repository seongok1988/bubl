-- 1단계: 통합 리허설 성공 시나리오
UPDATE freeze_status SET freeze_active = FALSE;
\i db/dummy_data_insert.sql
\i db/dummy_alert_history.sql
SELECT * FROM go_live_validation_view;
-- run_go_live_validation.ps1 실행 후 evidence_bundle.zip, manifest SHA256 비교
-- go_live_decision_log 기록
INSERT INTO go_live_decision_log (
    snapshot_id, decision_at, decision_hash, decision_result, validation_metrics_dump, immutable_flag, approved_by
) VALUES (
    1, NOW(), 'SHA256_OF_JSON', 'APPROVED', '{"policy_hash":"def456","snapshot_hash":"abc123","false_positive_rate":3.2,"sla_breach_count":0,"alert_per_hour":2,"attack_simulation_passed":true,"schema_version":"v1.2.3"}', TRUE, 'system'
);
UPDATE freeze_status SET freeze_active = TRUE;
-- 운영모드 전환 시도
UPDATE system_mode SET mode = 'PRODUCTION', updated_at = NOW() WHERE (SELECT go_live_status FROM go_live_validation_view LIMIT 1) = 'APPROVED';