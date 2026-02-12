-- 관리자 override 로그 테이블
CREATE TABLE IF NOT EXISTS override_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    override_by TEXT NOT NULL,
    override_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT
);