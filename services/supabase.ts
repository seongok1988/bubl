// ============================================================
// Supabase 클라이언트 초기화 (services/supabase.ts)
// 전역에서 재사용 가능한 싱글톤 인스턴스입니다.
// 환경 변수는 .env.local에서 관리합니다.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] 환경 변수가 설정되지 않았습니다: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase 클라이언트 싱글톤 인스턴스.
 * 클라이언트/서버 어디서든 이 인스턴스를 import하여 사용합니다.
 */
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

/**
 * Supabase 연결 테스트 유틸리티.
 * 개발 시 연결 상태 확인용으로 사용합니다.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('comments').select().limit(1);
    if (error) {
      console.error('[Supabase] 연결 오류:', error);
      return false;
    }
    console.log('[Supabase] 연결 성공, 데이터:', data);
    return true;
  } catch (err) {
    console.error('[Supabase] 연결 예외:', err);
    return false;
  }
}
