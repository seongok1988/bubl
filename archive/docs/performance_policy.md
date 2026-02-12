# 성능 및 안정성 기준

- landlord_scores_mv 조회 < 20ms
- REFRESH 5~10분 주기
- Seq Scan 발생 시 즉시 인덱스 재검토
- patch 실행 시 lock_timeout 필수
