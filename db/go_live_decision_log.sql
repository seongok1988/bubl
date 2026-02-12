-- go_live_decision_log 테이블
CREATE TABLE IF NOT EXISTS go_live_decision_log (
    id SERIAL PRIMARY KEY,
    snapshot_id INT NOT NULL,
    decision_at TIMESTAMP NOT NULL DEFAULT NOW(),
    decision_result TEXT NOT NULL,
    decision_hash TEXT NOT NULL,
    approved_by TEXT NOT NULL,
    immutable_flag BOOLEAN DEFAULT TRUE
);

-- 승인 기록 예시
INSERT INTO go_live_decision_log (snapshot_id, decision_result, decision_hash, approved_by)
VALUES (1, 'APPROVED', 'abc123hash', 'system');