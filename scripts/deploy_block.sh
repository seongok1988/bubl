#!/bin/bash
# 배포 차단 스크립트 (CI/CD에서 실행)
STATUS=$(psql -d dbname -t -c "SELECT go_live_status FROM go_live_validation_view LIMIT 1;")
if [[ "$STATUS" != "APPROVED" ]]; then
  echo "[BLOCKED] Go-Live 승인 상태가 아닙니다. 배포 중단."
  exit 1
else
  echo "[OK] Go-Live 승인 상태. 배포 진행."
fi