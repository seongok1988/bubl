# 관리자 콘솔 UI 상세 설계

## 1. 메인 대시보드 (Risk Overview)
- 전체 리뷰 수
- 승인 대기(pending)
- 신고 3회 이상 리뷰 수
- hidden 비율
- 최근 24시간 신규 리뷰 수
- 평균 가중 평점
- 이상 탐지 영역
  - 동일 IP 3건 이상
  - 동일 landlord 24시간 내 5건 이상
  - 평점 1점 급증 감지

## 2. 리뷰 관리 화면
### 리스트 컬럼
- report_id
- landlord_id
- reviewer_type
- rating
- weighted_rating
- trust_score
- status
- 신고 횟수
- 작성일

### 필터
- reviewer_type
- status
- 신고 ≥ 3
- 가중치 0.6 이하
- 평점 1~2점만 보기
- tenant만 보기

### 상세 화면
- 원문 내용
- JSONB 감정 분석 데이터
- reviewer_type
- lease_id
- 신고 내역 로그
- 수정 이력
- IP 기록
- 가중치 계산 로그

### 관리자 액션
- 승인
- 반려
- hidden
- reviewer_type 수정
- 가중치 일시 하향
- 강제 삭제
- 법적 보류 상태 전환

## 3. 임대인 반론 관리 화면
- 반론 작성 여부
- 반론 승인 상태
- 원 리뷰와 병렬 비교 뷰
- 분쟁 상태 태그
