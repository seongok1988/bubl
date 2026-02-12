-- policy hash match 테스트 테이블
CREATE TABLE IF NOT EXISTS policy_hash_check (
    id SERIAL PRIMARY KEY,
    db_policy_hash TEXT NOT NULL,
    doc_policy_hash TEXT NOT NULL,
    policy_hash_match BOOLEAN GENERATED ALWAYS AS (db_policy_hash = doc_policy_hash) STORED,
    checked_at TIMESTAMP DEFAULT NOW()
);