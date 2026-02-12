#!/bin/bash
# CDN/캐시 영향 테스트
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/write -H "Cache-Control: no-cache"
