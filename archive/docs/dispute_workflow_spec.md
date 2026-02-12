# 분쟁 대응 워크플로우 시스템화

## 리뷰 상태 전환
- pending
- approved
- temporary_hidden
- legal_hold (관리자 수정 불가, super_admin 2인 승인)
- hidden

## 분쟁 발생 시
- 자동 snapshot
- 로그 잠금
- MV refresh 중단
- 점수 고정

> legal_hold 상태는 법적 리스크 대응에 필수
