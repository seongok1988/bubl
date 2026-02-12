-- alert_history false_positive 테스트 데이터
INSERT INTO alert_history (alert_type, valid_alert, false_positive)
SELECT 'test', TRUE, FALSE FROM generate_series(1, 95);
INSERT INTO alert_history (alert_type, valid_alert, false_positive)
SELECT 'test', FALSE, TRUE FROM generate_series(1, 5);