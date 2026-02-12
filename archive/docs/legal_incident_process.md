# 분쟁 대응 매뉴얼 (실무 적용 버전)

## 1. 사건 등급 분류 체계
- Level 1: 일반 이의제기 (평점 불만, 주관적 표현, 감정적 표현)
  - 조치: temporary_hidden 검토 후 24시간 내 판단
- Level 2: 허위 주장 의심 (계약 관계 부존재, 사실 왜곡, 반복 신고)
  - 조치: lease_id 검증, reviewer_type 재검토, IP/계정 패턴 분석, risk_flag 부여 가능
- Level 3: 법적 위협/내용증명 (명예훼손, 삭제 요구 공문, 소송 예고)
  - 조치: 즉시 temporary_hidden, admin_audit_logs 백업, 법무 검토 프로세스 전환, 로그 보존 잠금

## 2. 삭제 기준 명문화
- 삭제는 증빙 기반
- 삭제 가능: 계약 관계 부존재, 개인정보 노출, 허위 사실 객관적 증빙
- 삭제 불가: 낮은 평점, 주관적 불만, 협상 평가
- 원칙: 삭제 대신 weight 조정 / risk_flag / temporary_hidden 우선 적용

## 3. 로그 보존 규칙
- admin_audit_logs 영구 보존
- 분쟁 리뷰 별도 snapshot 백업
- 법적 요청 시 원본 수정 금지
