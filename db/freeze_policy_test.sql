-- freeze 정책 실효성 검증 SQL
UPDATE freeze_status SET freeze_active = TRUE;
-- INSERT/UPDATE/DELETE 테스트
INSERT INTO reviewer_weights (type, weight) VALUES ('test', 1); -- 실패 예상
UPDATE reviewer_weights SET weight = 2 WHERE type = 'test'; -- 실패 예상
DELETE FROM reviewer_weights WHERE type = 'test'; -- 실패 예상
-- 관리자 override 예시
-- 실제 override 시 override_log 테이블에 기록 필요