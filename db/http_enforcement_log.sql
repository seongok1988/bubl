-- http_enforcement_log 테이블
CREATE TABLE IF NOT EXISTS http_enforcement_log (
    id SERIAL PRIMARY KEY,
    mode_at_request TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    blocked BOOLEAN NOT NULL,
    response_code INT NOT NULL,
    instance_id TEXT NOT NULL,
    request_timestamp TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    user_agent TEXT,
    client_ip TEXT,
    request_id TEXT,
    correlation_id TEXT
);

-- SAFE_MODE 중 차단 샘플 기록 예시
INSERT INTO http_enforcement_log (mode_at_request, endpoint, method, blocked, response_code, instance_id)
VALUES
('SAFE_MODE', '/api/write', 'POST', TRUE, 503, 'instance-1'),
('SAFE_MODE', '/api/write', 'POST', TRUE, 503, 'instance-2'),
('SAFE_MODE', '/admin/write', 'POST', TRUE, 503, 'instance-1'),
('SAFE_MODE', '/admin/write', 'POST', TRUE, 503, 'instance-2'),
('SAFE_MODE', '/api/write', 'POST', TRUE, 503, 'instance-1');