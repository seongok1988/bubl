# Full Mock Incident Drill (실전 분쟁 리허설)

## 시나리오 1: 임대인 내용증명 발송
- temporary_hidden → legal_hold 전환
- snapshot 생성
- audit_log 기록 확인
- 법무 검토 → 복원/삭제 결정

## 시나리오 2: 1점 리뷰 50개 동시 등록
- score_defense_logic 작동
- risk_flag 자동 증가
- final_score 변동률 측정

## 시나리오 3: operator가 특정 landlord 10건 hidden 처리
- internal_control_system 알림 발생
- 감사 로그 리포트 생성 확인

> 리허설에서 문제 발생 시 수정, 없으면 운영 투입 가능
