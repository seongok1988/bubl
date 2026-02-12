# 자동 점수 방어 로직

- 신규 계정 weight 감소
- 동일 IP 반복 리뷰 weight 자동 감소
- 단기간 1점 급증 시 trust_score 자동 하향
- risk_flag 리뷰는 final_score 계산 제외 또는 weight 50% 적용
