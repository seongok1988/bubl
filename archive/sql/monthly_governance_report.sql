-- 자동 감사 리포트 집계 SQL

-- 관리자별 상태 변경 횟수
SELECT admin_id, COUNT(*) AS status_changes
FROM admin_audit_logs
WHERE action IN ('approve','hidden','reject')
GROUP BY admin_id;

-- hidden 처리 비율
SELECT landlord_id, COUNT(*) FILTER (WHERE status = 'hidden')::float / COUNT(*) AS hidden_ratio
FROM landlord_reports
GROUP BY landlord_id;

-- reviewer_type 변경 횟수
SELECT admin_id, COUNT(*) AS reviewer_type_changes
FROM admin_audit_logs
WHERE action = 'reviewer_type_change'
GROUP BY admin_id;

-- risk_flag 부여 비율
SELECT admin_id, COUNT(*) AS risk_flag_changes
FROM admin_audit_logs
WHERE action = 'risk_flag_set'
GROUP BY admin_id;

-- weight 변경 이력
SELECT admin_id, COUNT(*) AS weight_changes
FROM admin_audit_logs
WHERE action = 'weight_change'
GROUP BY admin_id;

-- landlord별 score 변동률
SELECT landlord_id, MAX(score) - MIN(score) AS score_variation
FROM landlord_scores_mv
GROUP BY landlord_id;
