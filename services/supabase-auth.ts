// ============================================================
// 요청별 인증 Supabase 클라이언트 (services/supabase-auth.ts)
// API Route에서 사용자 JWT를 검증하고 인증된 쿼리를 실행합니다.
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * 요청의 Authorization 헤더에서 JWT를 추출하여
 * 해당 사용자 컨텍스트의 Supabase 클라이언트를 생성합니다.
 * RLS가 정상 적용됩니다.
 */
export function createAuthClient(req: NextRequest): SupabaseClient {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 요청에서 인증된 사용자 ID를 추출합니다.
 * 인증되지 않은 경우 null을 반환합니다.
 */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const client = createAuthClient(req);
  const {
    data: { user },
  } = await client.auth.getUser();
  return user?.id ?? null;
}
