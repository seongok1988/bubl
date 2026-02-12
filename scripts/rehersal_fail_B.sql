-- 실패 테스트 B: SLA breach 1건
UPDATE freeze_status SET freeze_active = FALSE;
INSERT INTO alerts (alert_id, created_at, status) VALUES ('ALERT-BREACH', NOW() - INTERVAL '31 minutes', 'pending');
SELECT * FROM go_live_validation_view;
-- breached 자동 기록, escalation, 승인 불가