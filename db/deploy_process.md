# 운영 배포 프로세스 템플릿

1. patch_precheck.sql 실행
2. staging patch 적용
3. staging explain analyze
4. staging MV refresh
5. staging 1점 공격 시뮬레이션
6. production read replica에서 사전 실행
7. production 적용
8. production MV concurrent refresh
9. 24시간 모니터링
