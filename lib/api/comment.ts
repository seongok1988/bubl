import { supabase } from '../supabase';


// 댓글 목록 조회 (비밀 댓글 권한 처리)
export async function fetchComments(postId: string, currentUserId: string, postAuthorId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  // 비밀 댓글 처리: 본인/게시글 작성자만 내용 노출
  return data.map((comment: any) => {
    if (comment.is_secret && comment.user_id !== currentUserId && postAuthorId !== currentUserId) {
      return { ...comment, content: '비밀 댓글입니다', is_secret: true };
    }
    return comment;
  });
}


// 댓글 작성 (is_secret 지원)
export async function createComment({ post_id, user_id, content, is_secret = false }: { post_id: string; user_id: string; content: string; is_secret?: boolean }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id, user_id, content, is_secret }])
    .select();
  if (error) throw error;
  return data?.[0];
}
