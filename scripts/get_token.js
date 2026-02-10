// scripts/get_token.js
// 안전한 토큰 요청 스크립트 (Node 18+ 권장)
(async () => {
  try {
    const fetchImpl = global.fetch ?? (await import('node-fetch')).default;
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sjieerzgpvlgxhhygrcl.supabase.co';
    const ANON_KEY = process.env.ANON_KEY || 'sb_publishable_8Lr6IAxkutQ7c1ZELiN81w_gFQkhCNi';
    const email = process.env.EMAIL || 'tester@example.com';
    const password = process.env.PASSWORD || 'Test1234!';

    const res = await fetchImpl(`${SUPABASE_URL}/auth/v1/token`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password, grant_type: 'password' })
    });

    const text = await res.text();
    try {
      const j = JSON.parse(text);
      console.log(JSON.stringify(j, null, 2));
      if (j.access_token) console.log('\nACCESS_TOKEN:', j.access_token);
    } catch (e) {
      console.log(text);
    }
  } catch (err) {
    console.error('ERROR:', err);
    process.exitCode = 1;
  }
})();
