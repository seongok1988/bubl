-- 운영모드 전환 차단 SQL
CREATE TABLE IF NOT EXISTS system_mode (
    id SERIAL PRIMARY KEY,
    mode TEXT NOT NULL DEFAULT 'STAGING',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 운영모드 전환 시 승인 조건
UPDATE system_mode SET mode = 'PRODUCTION', updated_at = NOW()
WHERE (SELECT go_live_status FROM go_live_validation_view LIMIT 1) = 'APPROVED';