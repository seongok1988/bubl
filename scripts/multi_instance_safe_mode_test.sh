#!/bin/bash
# 멀티 인스턴스 SAFE_MODE 동기화 테스트
for i in 1 2; do
  ssh server$i "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/write -X POST -d '{\"data\":\"test\"}'"
done
