import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('comments').select().limit(1)
    if (error) {
      console.error('Supabase 연결 오류:', error)
      return false
    }
    console.log('Supabase 연결 성공, 데이터:', data)
    return true
  } catch (err) {
    console.error('Supabase 연결 예외:', err)
    return false
  }
}
