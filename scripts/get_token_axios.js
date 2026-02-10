// scripts/get_token_axios.js
const axios = require('axios');
const qs = require('qs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sjieerzgpvlgxhhygrcl.supabase.co';
const ANON_KEY = process.env.ANON_KEY || 'sb_publishable_8Lr6IAxkutQ7c1ZELiN81w_gFQkhCNi';
const email = process.env.EMAIL || 'tester@example.com';
const password = process.env.PASSWORD || 'Test1234!';

(async () => {
  try {
    const res = await axios.post(
      `${SUPABASE_URL}/auth/v1/token`,
      qs.stringify({ email, password, grant_type: 'password' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', apikey: ANON_KEY } }
    );
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('STATUS', err.response.status);
      try { console.log(JSON.stringify(err.response.data, null, 2)); } catch(e){ console.log(err.response.data); }
    } else {
      console.error('ERROR', err.message);
    }
    process.exitCode = 1;
  }
})();
