# 운영 DB 롤백 전략 문서

- 컬럼 추가: 사용 중지 + nullable 처리
- ENUM 추가: 롤백 없음, deprecated 처리
- 트리거 추가: disable 방식
- MV 수정: 이전 버전 view 유지

## 복구 시나리오 예시

1. 컬럼 추가 후 문제 발생 시
   - ALTER TABLE ... ALTER COLUMN ... SET DEFAULT NULL;
   - 애플리케이션에서 해당 컬럼 사용 중지

2. ENUM 추가 후 문제 발생 시
   - ENUM 값 deprecated 처리, 신규 값 사용 금지

3. 트리거 추가 후 문제 발생 시
   - 트리거 disable (ALTER TABLE ... DISABLE TRIGGER ...)

4. MV 수정 후 문제 발생 시
   - 기존 MV rename, 이전 버전 view로 복구

## 롤백은 SQL이 아니라 운영 시나리오로 관리
