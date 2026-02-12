# 데이터 불변성 보호 (Immutable Snapshot Strategy)

## 구조
- legal_hold 상태 시 review_snapshot 테이블 자동 insert
- snapshot은 수정/삭제 불가
- snapshot_id를 audit_log에 연결
- MV refresh 시 legal_hold 데이터 점수 계산 제외
