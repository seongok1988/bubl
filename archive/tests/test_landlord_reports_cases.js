// landlord_reports 실전 테스트 코드 예시
// npm install @supabase/supabase-js dotenv
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_TENANT = process.env.JWT_TENANT;
const JWT_VISITOR = process.env.JWT_VISITOR;
const JWT_ADMIN = process.env.JWT_ADMIN;
const landlord_id = process.env.LANDLORD_ID;
const author_id_tenant = process.env.AUTHOR_ID_TENANT;
const author_id_visitor = process.env.AUTHOR_ID_VISITOR;
const lease_id = process.env.LEASE_ID;

function supabaseFor(jwt) {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

async function run() {
  // 1. author_id 위변조 테스트
  const sb = supabaseFor(JWT_VISITOR);
  const { error } = await sb.from('landlord_reports').insert({
    landlord_id, author_id: author_id_tenant, rating: 5, reviewer_type: 'tenant', lease_id
  });
  console.log(error ? '✅ author_id 위변조 차단' : '❌ author_id 위변조 허용');

  // 2. reviewer_type 위변조
  const sb2 = supabaseFor(JWT_VISITOR);
  const { error: error2 } = await sb2.from('landlord_reports').insert({
    landlord_id, author_id: author_id_visitor, rating: 5, reviewer_type: 'tenant', lease_id
  });
  console.log(error2 ? '✅ reviewer_type 위변조 차단' : '❌ reviewer_type 위변조 허용');

  // 3. status 직접 변경 시도
  const sb3 = supabaseFor(JWT_VISITOR);
  const { error: error3 } = await sb3.from('landlord_reports').update({ status: 'approved' }).eq('author_id', author_id_visitor);
  console.log(error3 ? '✅ status 직접 변경 차단' : '❌ status 직접 변경 허용');

  // 4. 신고 3회 자동 hidden 테스트
  // 실제 환경에 맞게 신고 테이블 insert 후 landlord_reports.status 확인 필요
}

run();
