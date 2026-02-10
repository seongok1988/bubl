import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sjieerzgpvlgxhhygrcl.supabase.co';
const ANON_KEY = process.env.ANON_KEY || 'sb_publishable_8Lr6IAxkutQ7c1ZELiN81w_gFQkhCNi';
const email = process.env.EMAIL || 'tester@example.com';
const password = process.env.PASSWORD || 'Test1234!';

const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
const res = await supabase.auth.signInWithPassword({ email, password });
console.log(JSON.stringify(res, null, 2));
