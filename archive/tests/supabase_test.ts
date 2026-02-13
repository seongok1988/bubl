import { testSupabaseConnection } from '../../services/supabase';

(async () => {
  const result = await testSupabaseConnection()
  console.log('Supabase 연결 테스트 결과:', result)
})();
