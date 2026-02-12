-- 공격 시뮬레이션 결과 테이블
CREATE TABLE IF NOT EXISTS attack_simulation_result (
    id SERIAL PRIMARY KEY,
    attack_type TEXT NOT NULL,
    pre_attack_score NUMERIC NOT NULL,
    post_attack_score NUMERIC NOT NULL,
    score_delta NUMERIC NOT NULL,
    risk_flag_change TEXT NOT NULL,
    hidden_count_change INT NOT NULL,
    auto_defense_triggered BOOLEAN NOT NULL,
    defense_success BOOLEAN GENERATED ALWAYS AS (auto_defense_triggered AND score_delta <= 10 AND risk_flag_change = 'expected') STORED,
    executed_at TIMESTAMP DEFAULT NOW()
);