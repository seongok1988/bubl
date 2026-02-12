-- snapshot immutable hash match 테스트 테이블
CREATE TABLE IF NOT EXISTS snapshot_immutable_test (
    id SERIAL PRIMARY KEY,
    snapshot_hash_before TEXT NOT NULL,
    snapshot_hash_after TEXT NOT NULL,
    hash_match BOOLEAN GENERATED ALWAYS AS (snapshot_hash_before = snapshot_hash_after) STORED,
    tested_at TIMESTAMP DEFAULT NOW()
);