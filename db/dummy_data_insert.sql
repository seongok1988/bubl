-- alert 더미 데이터 100건 삽입
INSERT INTO alerts (alert_id, created_at, acknowledged_at, status)
SELECT 'ALERT-' || i, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes', 'acknowledged'
FROM generate_series(1, 95) AS i;
-- SLA breach 5건(30분 초과)
INSERT INTO alerts (alert_id, created_at, status)
SELECT 'ALERT-BREACH-' || i, NOW() - INTERVAL '40 minutes', 'pending'
FROM generate_series(1, 5) AS i;

-- attack_simulation_result 3회 방어 성공
INSERT INTO attack_simulation_result (attack_type, pre_attack_score, post_attack_score, score_delta, risk_flag_change, hidden_count_change, auto_defense_triggered)
VALUES
('score manipulation', 80, 75, 5, 'expected', 0, TRUE),
('ip repeat', 90, 85, 5, 'expected', 1, TRUE),
('hidden abuse', 70, 65, 5, 'expected', 2, TRUE);

-- snapshot/policy hash 동일값 입력
INSERT INTO snapshot_immutable_test (snapshot_hash_before, snapshot_hash_after)
VALUES ('abc123', 'abc123');
INSERT INTO policy_hash_check (db_policy_hash, doc_policy_hash)
VALUES ('def456', 'def456');