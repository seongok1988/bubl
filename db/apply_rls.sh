#!/usr/bin/env bash
# Apply RLS policies to the connected Postgres database.
# Safe, interactive helper for non-developers.
# Usage (interactive):
#   ./db/apply_rls.sh
# Usage (CI or script):
#   PSQL_CONN="postgresql://user:pass@host:5432/dbname" ./db/apply_rls.sh

set -euo pipefail

echo "--- RLS 적용 스크립트 (db/rls_policies.sql) ---"

if [ -z "${PSQL_CONN:-}" ]; then
  echo "PSQL_CONN 환경변수가 설정되어 있지 않습니다."
  read -p "psql 연결 문자열을 입력하세요 (예: postgresql://user:pass@host:5432/dbname) : " PSQL_CONN
  if [ -z "$PSQL_CONN" ]; then
    echo "연결 문자열이 필요합니다. 취소합니다."
    exit 1
  fi
fi

echo "적용 중: RLS 정책을 데이터베이스에 적용합니다..."
psql "$PSQL_CONN" -f db/rls_policies.sql

echo "RLS 정책이 적용되었습니다. 간단 검증을 실행합니다..."

echo "1) pg_policies 목록 확인:"
psql "$PSQL_CONN" -c "SELECT schemaname, tablename, policyname, permissive FROM pg_policies WHERE tablename IN ('posts','comments');"

echo "2) (선택) 서비스 계정으로 테스트용 게시물 삽입"
echo "   - 만약 관리자(서비스) 권한으로 삽입 테스트를 원하시면 아래 명령을 복사해 실행하세요."
echo "     psql \"$PSQL_CONN\" -c \"INSERT INTO public.posts (community_id, user_id, title, content) VALUES (gen_random_uuid(), gen_random_uuid(), 'smoke-test', '자동 삽입 테스트')\""

echo "참고: Supabase 콘솔 > SQL 에서 직접 붙여넣어 실행하셔도 됩니다."
echo "완료."
