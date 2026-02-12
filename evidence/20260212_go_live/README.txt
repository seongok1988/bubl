이 폴더는 2026년 2월 12일 Go-Live 실증 자료를 보관합니다.

- policy_db_sync_result.csv: 정책-DB 동기화 감사 쿼리 결과
- execution_log.txt: 실행 시각, DB schema version, Git commit hash, 실행자 계정, 결과 row count 포함
- schema_version.txt: 현재 DB schema version 기록
- 공격 시뮬레이션 리포트: PDF+CSV
- monthly_governance_report: 생성 시각, 자동 생성 여부, SHA256 checksum 포함
- legal_hold snapshot: snapshot table명, row count, hash, 시작 시간, 사건 ID 포함
- admin_audit_logs 샘플: action_type, performed_by, target_id, timestamp, before/after 상태 포함
- MV refresh 로그: 시작/종료 시각, 처리 row 수, lock/에러 발생 여부 포함

실제 데이터는 자동화 스크립트 실행 후 저장됩니다.