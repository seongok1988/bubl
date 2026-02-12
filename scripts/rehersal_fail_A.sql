-- 실패 테스트 A: false_positive_rate = 7%
UPDATE freeze_status SET freeze_active = FALSE;
DELETE FROM alert_history;
INSERT INTO alert_history (alert_type, valid_alert, false_positive)
SELECT 'test', TRUE, FALSE FROM generate_series(1, 93);
INSERT INTO alert_history (alert_type, valid_alert, false_positive)
SELECT 'test', FALSE, TRUE FROM generate_series(1, 7);
SELECT * FROM go_live_validation_view;
-- 배포 차단, freeze 전환 안 됨