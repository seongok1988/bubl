-- breach 자동화 타이머 검증 SQL
-- 30분 초과 pending alert 생성
INSERT INTO alerts (alert_id, created_at, status) VALUES ('ALERT-TIMER', NOW() - INTERVAL '31 minutes', 'pending');
-- 트리거/스케줄러 실행 후 status, breach_at, auto_breach_flag 확인
SELECT * FROM alerts WHERE alert_id = 'ALERT-TIMER';