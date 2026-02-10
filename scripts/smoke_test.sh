#!/usr/bin/env bash
# 간단 스모크 테스트: 로컬 또는 배포된 사이트의 주요 엔드포인트 확인
# 사용법:
#   BASE_URL=http://localhost:3000 ./scripts/smoke_test.sh
# 또는
#   BASE_URL=https://your-vercel-url ./scripts/smoke_test.sh

set -euo pipefail
BASE_URL=${BASE_URL:-http://localhost:3000}

echo "스모크 테스트 시작: $BASE_URL"

# 1) 루트 페이지
echo "- GET /"
curl -sS -f "$BASE_URL/" >/dev/null && echo "  OK: 루트 페이지 응답" || echo "  FAIL: 루트 페이지"

# 2) 카카오 주소 검색 API
echo "- GET /api/kakao-address?query=seoul"
if curl -sS "$BASE_URL/api/kakao-address?query=seoul" | jq . >/dev/null 2>&1; then
  echo "  OK: kakao-address 응답(형식 확인)"
else
  echo "  WARN/FAIL: kakao-address 응답 확인 필요"
fi

# 3) 게시글 리스트 조회 (public GET)
echo "- GET /api/posts"
if curl -sS "$BASE_URL/api/posts" | jq . >/dev/null 2>&1; then
  echo "  OK: posts API 응답(형식 확인)"
else
  echo "  WARN/FAIL: posts API 응답 확인 필요"
fi

# 안내
cat <<EOF
스모크 테스트 완료.
- 게시글 생성/수정/삭제는 인증 토큰(Bearer)이 필요합니다.
- RLS와 쓰기 테스트는 서비스 역할 키 또는 PSQL_CONN을 사용한 DB 직접 테스트가 필요합니다.
EOF
