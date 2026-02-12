#!/bin/bash
# 동시 요청 테스트
for i in {1..20}; do
  curl -s -o /dev/null -w "%{http_code}" http://localhost/api/write -X POST -d '{"data":"test"}' &
done
wait
