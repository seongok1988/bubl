# Go-Live 승인 프로세스 (Release Governance)

## 필수 절차
- 정책–DB 동기화 감사 SQL 실행 결과 캡처 보관
- 공격 시뮬레이션 리포트 저장
- 감사 리포트 샘플 1회 생성
- SLA 측정 테스트 결과 저장
- 롤백 절차 리허설 완료 확인

> 5개 항목 충족 시 production 전환 승인
> 승인 기록은 admin_audit_logs와 별도 저장소(문서)에 보관
