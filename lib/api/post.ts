import { supabase } from '../supabase';

// 게시글 목록 조회
export async function fetchPosts(communityId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}


// 게시글 작성
export async function createPost({ community_id, user_id, title, content }: { community_id: string; user_id: string; title: string; content: string }) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ community_id, user_id, title, content }])
    .select();
  if (error) throw error;
  return data?.[0];
}

// 게시글 수정 (본인만 가능)
export async function updatePost({ post_id, user_id, title, content }: { post_id: string; user_id: string; title: string; content: string }) {
  // user_id로 본인 글인지 확인
  const { data: post, error: fetchError } = await supabase.from('posts').select('user_id').eq('id', post_id).single();
  if (fetchError) throw fetchError;
  if (!post || post.user_id !== user_id) throw new Error('수정 권한이 없습니다.');
  const { data, error } = await supabase
    .from('posts')
    .update({ title, content })
    .eq('id', post_id)
    .select();
  if (error) throw error;
  return data?.[0];
}

// 게시글 삭제 (본인만 가능)
export async function deletePost({ post_id, user_id }: { post_id: string; user_id: string }) {
  // user_id로 본인 글인지 확인
  const { data: post, error: fetchError } = await supabase.from('posts').select('user_id').eq('id', post_id).single();
  if (fetchError) throw fetchError;
  if (!post || post.user_id !== user_id) throw new Error('삭제 권한이 없습니다.');
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', post_id);
  if (error) throw error;
  return true;
}
