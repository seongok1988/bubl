-- SAFE_MODE 자동 전환 로직
UPDATE system_mode SET mode = 'SAFE_MODE', updated_at = NOW()
WHERE (SELECT go_live_status FROM go_live_validation_view LIMIT 1) != 'APPROVED';