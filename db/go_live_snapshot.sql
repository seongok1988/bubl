-- go_live_snapshot 테이블 구조 샘플
CREATE TABLE IF NOT EXISTS go_live_snapshot (
    id SERIAL PRIMARY KEY,
    snapshot_at TIMESTAMP NOT NULL DEFAULT NOW(),
    db_schema_version TEXT NOT NULL,
    policy_hash TEXT NOT NULL,
    reviewer_weights_dump TEXT NOT NULL,
    landlord_scores_mv_snapshot TEXT NOT NULL,
    alert_threshold_settings TEXT NOT NULL,
    evidence_bundle_hash TEXT NOT NULL,
    manifest_hash TEXT NOT NULL,
    total_files INT NOT NULL,
    total_rows INT NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    executed_by TEXT NOT NULL
);

-- Freeze 검증 트리거 예시
CREATE OR REPLACE FUNCTION prevent_policy_change_during_freeze()
RETURNS trigger AS $$
BEGIN
    IF (current_date BETWEEN '2026-02-12' AND '2026-03-12') THEN
        RAISE EXCEPTION 'Freeze 기간 중 정책 변경 불가';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 예시: reviewer_weights 변경 시 트리거
CREATE TRIGGER freeze_policy_change
BEFORE UPDATE ON reviewer_weights
FOR EACH ROW EXECUTE FUNCTION prevent_policy_change_during_freeze();