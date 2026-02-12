-- 실패 테스트 C: policy_hash 불일치
UPDATE freeze_status SET freeze_active = FALSE;
DELETE FROM policy_hash_check;
INSERT INTO policy_hash_check (db_policy_hash, doc_policy_hash) VALUES ('def456', 'xyz789');
SELECT * FROM go_live_validation_view;
-- 즉시 REJECTED