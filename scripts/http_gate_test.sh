#!/bin/bash
# HTTP gate 테스트 스크립트
curl -s -o /dev/null -w "%{http_code}" http://localhost/health
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/write -X POST -d '{"data":"test"}'
curl -s -o /dev/null -w "%{http_code}" http://localhost/admin
