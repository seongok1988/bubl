# 관리자 오남용 감시 체계 (Internal Control System)

## 1. 권한 분리
- operator: approve/hidden, reviewer_type 수정 불가
- super_admin: reviewer_weights/정책 변경
- auditor: 조회/내보내기만 가능, 수정 불가

## 2. 자동 감시 로직
- 동일 관리자가 동일 landlord 5회 이상 상태 변경 시 알림
- 특정 landlord hidden 비율 70% 초과 시 알림
- weight 수정 후 점수 급등락 15% 이상 시 알림
- risk_flag 과다 사용 시 알림

## 3. 월간 감사 리포트 항목
- 관리자별 조치 건수
- landlord별 hidden 비율
- reviewer_type 수정 이력
- weight 변경 이력
- 삭제 건수 및 사유
- 감사 리포트는 super_admin 외 열람 금지
