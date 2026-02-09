import { supabase } from '../supabase';

// 커뮤니티 목록 조회
export async function fetchCommunities() {
  const { data, error } = await supabase.from('communities').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// 커뮤니티 생성
export async function createCommunity({ name, description }: { name: string; description: string }) {
  const { data, error } = await supabase.from('communities').insert([{ name, description }]).select();
  if (error) throw error;
  return data?.[0];
}

// 커뮤니티 상세 조회
export async function fetchCommunityById(id: string) {
  const { data, error } = await supabase.from('communities').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
