// ============================================================
// Services 인덱스 (services/index.ts)
// Supabase 클라이언트들을 한 곳에서 re-export합니다.
// ============================================================

export { supabase, testSupabaseConnection } from './supabase';
export { supabaseAdmin } from './supabase-server';
export { createAuthClient, getAuthUserId } from './supabase-auth';
