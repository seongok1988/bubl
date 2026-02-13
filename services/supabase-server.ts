// ============================================================
// 서버 전용 Supabase 클라이언트 (services/supabase-server.ts)
// API Route에서만 사용하며, service_role 키로 RLS를 우회합니다.
// 절대 클라이언트(브라우저)에서 import하지 마세요.
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('[Supabase-Server] NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
}

if (!supabaseServiceRoleKey) {
  console.warn(
    '[Supabase-Server] SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. ' +
      'API Route에서 관리자 권한으로 DB 접근이 필요하면 이 키를 .env.local에 추가하세요.'
  );
}

/**
 * 서버 전용 Supabase 관리자 클라이언트.
 * service_role 키를 사용하므로 RLS를 우회합니다.
 * API Route 핸들러에서만 사용하세요.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseServiceRoleKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
