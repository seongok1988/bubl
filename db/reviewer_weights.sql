-- reviewer_weights 테이블 분리
CREATE TABLE IF NOT EXISTS reviewer_weights (
  reviewer_type reviewer_type PRIMARY KEY,
  weight numeric(2,1) NOT NULL
);

INSERT INTO reviewer_weights (reviewer_type, weight) VALUES
  ('verified_tenant', 1.0),
  ('agent', 0.8),
  ('visitor', 0.6),
  ('general', 0.4)
ON CONFLICT (reviewer_type) DO NOTHING;
