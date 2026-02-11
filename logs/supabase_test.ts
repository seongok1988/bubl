import { testSupabaseConnection } from './lib/supabase.ts';

(async () => {
  const result = await testSupabaseConnection()
  console.log('Supabase 연결 테스트 결과:', result)
})();
