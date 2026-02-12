-- reviewer_weights 테이블 기반 가중 평균 평점 집계 쿼리
SELECT 
    lr.landlord_id,
    SUM(lr.rating * rw.weight) / NULLIF(SUM(rw.weight),0) AS weighted_rating
FROM landlord_reports lr
JOIN reviewer_weights rw ON lr.reviewer_type = rw.reviewer_type
WHERE lr.status = 'approved'
GROUP BY lr.landlord_id;
