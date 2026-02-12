# 관리자 오남용 방지 규정

## 권한 구조
- operator: approve/hidden, risk_flag 부여
- super_admin: weight 수정, 정책 변경
- auditor: 조회만 가능, 수정 불가

## 운영 통제
- 모든 관리자 액션은 admin_audit_logs에 자동 기록
- 로그 삭제 금지
- 월 1회 감사 리포트 생성
- 동일 관리자가 동일 임대인 5회 이상 조치 시 경고 알림
