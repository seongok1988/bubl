-- landlord_scores 신뢰 점수 포함 집계 뷰
CREATE VIEW landlord_scores AS
SELECT 
    lr.landlord_id,
    SUM(lr.rating * rw.weight) / SUM(rw.weight) AS weighted_rating,
    COUNT(*) AS review_count,
    SUM(CASE WHEN lr.is_verified THEN 1 ELSE 0 END)::float / COUNT(*) AS verified_ratio
FROM landlord_reports lr
JOIN reviewer_weights rw ON lr.reviewer_type = rw.reviewer_type
WHERE lr.status = 'approved'
GROUP BY lr.landlord_id;

-- 위험도 점수 계산 예시
SELECT *,
(
    weighted_rating * 0.6 +
    verified_ratio * 0.2 +
    LOG(review_count + 1) * 0.2
) AS trust_score
FROM landlord_scores;
