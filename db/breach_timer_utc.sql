-- breach 타이머 UTC 고정
UPDATE alerts SET status = 'breached', breach_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC', auto_breach_flag = TRUE
WHERE status = 'pending' AND (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - created_at) > INTERVAL '30 minutes';