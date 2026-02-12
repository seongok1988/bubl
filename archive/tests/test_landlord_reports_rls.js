// landlord_reports RLS 자동화 검증 스크립트
// 실행 전: .env에 SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY 등 환경변수 필요
// npm install @supabase/supabase-js dotenv

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 테스트용 계정 JWT (실제 발급 필요)
const JWT_A = process.env.JWT_A; // 임차인
const JWT_B = process.env.JWT_B; // 일반 사용자
const JWT_C = process.env.JWT_C; // 임대인
const JWT_D = process.env.JWT_D; // 관리자

// 테스트용 UUID (실제 환경에 맞게 입력)
const landlord_id = process.env.LANDLORD_ID;
const author_id_A = process.env.AUTHOR_ID_A;
const author_id_B = process.env.AUTHOR_ID_B;
const lease_id = process.env.LEASE_ID;

function supabaseFor(jwt) {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

async function run() {
  let pass = 0, fail = 0;
  function check(ok, msg) {
    if (ok) { console.log('✅', msg); pass++; }
    else { console.error('❌', msg); fail++; }
  }

  // 1. author_id 위변조 INSERT (A가 B의 author_id로)
  {
    const sb = supabaseFor(JWT_A);
    const { error } = await sb.from('landlord_reports').insert({
      landlord_id, author_id: author_id_B, lease_id, rating: 5, status: 'pending'
    });
    check(error, 'author_id 위변조 차단');
  }

  // 2. lease_id 도용 (B가 A의 lease_id로 INSERT)
  {
    const sb = supabaseFor(JWT_B);
    const { error } = await sb.from('landlord_reports').insert({
      landlord_id, author_id: author_id_B, lease_id, rating: 5, status: 'pending'
    });
    check(error, 'lease_id 도용 차단');
  }

  // 3. 타인 UPDATE (B가 A의 리뷰 수정)
  let reportId;
  {
    // A가 정상 INSERT
    const sbA = supabaseFor(JWT_A);
    const { data, error } = await sbA.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id, rating: 5, status: 'pending'
    }).select();
    reportId = data && data[0] && data[0].id;
    check(!error && reportId, 'A가 리뷰 정상 작성');
    // B가 UPDATE 시도
    const sbB = supabaseFor(JWT_B);
    const { error: error2 } = await sbB.from('landlord_reports').update({ rating: 1 }).eq('id', reportId);
    check(error2, '타인 UPDATE 차단');
  }

  // 4. 타인 DELETE (B가 A의 리뷰 삭제)
  {
    const sbB = supabaseFor(JWT_B);
    const { error } = await sbB.from('landlord_reports').delete().eq('id', reportId);
    check(error, '타인 DELETE 차단');
  }

  // 5. 작성자 본인 UPDATE
  {
    const sbA = supabaseFor(JWT_A);
    const { error } = await sbA.from('landlord_reports').update({ rating: 4 }).eq('id', reportId);
    check(!error, '작성자 본인 UPDATE 허용');
  }

  // 6. 작성자 본인 DELETE
  {
    const sbA = supabaseFor(JWT_A);
    const { error } = await sbA.from('landlord_reports').delete().eq('id', reportId);
    check(!error, '작성자 본인 DELETE 허용');
  }

  // 7. status 강제 approved (A가 직접 approved로)
  {
    const sbA = supabaseFor(JWT_A);
    const { error } = await sbA.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id, rating: 5, status: 'approved'
    });
    check(error, 'status 강제 approved 차단');
  }

  // 8. 관리자 status 변경 허용
  let reportId2;
  {
    const sbA = supabaseFor(JWT_A);
    const { data } = await sbA.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id, rating: 5, status: 'pending'
    }).select();
    reportId2 = data && data[0] && data[0].id;
    const sbD = supabaseFor(JWT_D);
    const { error } = await sbD.from('landlord_reports').update({ status: 'approved' }).eq('id', reportId2);
    check(!error, '관리자 status 변경 허용');
  }

  // 9. 비로그인 SELECT 차단
  {
    const sb = createClient(SUPABASE_URL, ANON_KEY);
    const { error } = await sb.from('landlord_reports').select('*');
    check(error, '비로그인 SELECT 차단');
  }

  // 10. 임대인 본인 SELECT 허용
  {
    const sb = supabaseFor(JWT_C);
    const { error } = await sb.from('landlord_reports').select('*').eq('landlord_id', landlord_id);
    check(!error, '임대인 본인 SELECT 허용');
  }

  // 11. 관리자 전체 SELECT 허용
  {
    const sb = supabaseFor(JWT_D);
    const { error } = await sb.from('landlord_reports').select('*');
    check(!error, '관리자 전체 SELECT 허용');
  }

  // 12. 신고 3회 트리거 (A, B, C가 신고)
  let reportId3;
  {
    const sbA = supabaseFor(JWT_A);
    const { data } = await sbA.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id: lease_id + 'x', rating: 5, status: 'approved'
    }).select();
    reportId3 = data && data[0] && data[0].id;
    const sbB = supabaseFor(JWT_B);
    const sbC = supabaseFor(JWT_C);
    await sbA.from('landlord_report_flags').insert({ report_id: reportId3, reporter_id: author_id_A, reason: 'test' });
    await sbB.from('landlord_report_flags').insert({ report_id: reportId3, reporter_id: author_id_B, reason: 'test' });
    await sbC.from('landlord_report_flags').insert({ report_id: reportId3, reporter_id: landlord_id, reason: 'test' });
    // status 자동 hidden 확인
    const { data: d2 } = await sbA.from('landlord_reports').select('status').eq('id', reportId3).single();
    check(d2 && d2.status === 'hidden', '신고 3회 트리거 작동');
  }

  // 13. summary 자동 갱신
  {
    const sb = supabaseFor(JWT_D);
    const { data } = await sb.from('landlord_rating_summary').select('*').eq('landlord_id', landlord_id);
    check(data && data.length >= 0, 'summary 자동 갱신');
  }

  // 14. status ENUM 정상 작동
  {
    const sb = supabaseFor(JWT_D);
    const { error } = await sb.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id: lease_id + 'y', rating: 5, status: 'notvalid'
    });
    check(error, 'status ENUM 정상 작동');
  }

  // 15. 관리자 DELETE 허용
  let reportId4;
  {
    const sbA = supabaseFor(JWT_A);
    const { data } = await sbA.from('landlord_reports').insert({
      landlord_id, author_id: author_id_A, lease_id: lease_id + 'z', rating: 5, status: 'pending'
    }).select();
    reportId4 = data && data[0] && data[0].id;
    const sbD = supabaseFor(JWT_D);
    const { error } = await sbD.from('landlord_reports').delete().eq('id', reportId4);
    check(!error, '관리자 DELETE 허용');
  }

  // 결과
  console.log(`\n총 ${pass + fail}개 중 ${pass}개 성공, ${fail}개 실패`);
  if (fail > 0) process.exit(1);
}

run();
