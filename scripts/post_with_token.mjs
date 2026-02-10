import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sjieerzgpvlgxhhygrcl.supabase.co';
const ANON_KEY = process.env.ANON_KEY || 'sb_publishable_8Lr6IAxkutQ7c1ZELiN81w_gFQkhCNi';
const email = process.env.EMAIL || 'tester@example.com';
const password = process.env.PASSWORD || 'Test1234!';

const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

const sign = await supabase.auth.signInWithPassword({ email, password });
if (sign.error) {
  console.error('Sign-in error:', sign.error);
  process.exit(1);
}
const token = sign.data.session.access_token;
console.log('Got token, length:', token.length);

const resp = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ community_id: '84ef0c08-1541-49ff-968c-7df7239520a8', title: 'Client auth flow test', content: 'Posted from scripts/post_with_token.mjs' })
});
const out = await resp.text();
console.log('STATUS', resp.status);
console.log(out);
