import { supabase } from '@/services/supabase';
import type { CommentRow } from '@/types/db';

// ---- 댓글 등록 (로그인 사용자 자동 주입) ----
export async function createComment({
  post_id,
  content,
  is_secret = false,
}: {
  post_id: string;
  content: string;
  is_secret?: boolean;
}): Promise<CommentRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.id) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id, user_id: user.id, content, is_secret }])
    .select();
  if (error) {
    console.error('댓글 insert 실패:', error.message);
    throw error;
  }
  return data?.[0] as CommentRow;
}

// ---- 댓글 수정 ----
export async function updateComment({
  comment_id,
  content,
  is_secret,
}: {
  comment_id: string;
  content: string;
  is_secret?: boolean;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data: comment, error: fetchErr } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', comment_id)
    .single();
  if (fetchErr) throw fetchErr;
  if (!comment || comment.author_id !== user.id)
    throw new Error('수정 권한이 없습니다.');

  const { data, error } = await supabase
    .from('comments')
    .update({ content, is_secret, updated_at: new Date().toISOString() })
    .eq('id', comment_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- 댓글 삭제 ----
export async function deleteComment({ comment_id }: { comment_id: string }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data: comment, error: fetchErr } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', comment_id)
    .single();
  if (fetchErr) throw fetchErr;
  if (!comment || comment.author_id !== user.id)
    throw new Error('삭제 권한이 없습니다.');

  const { error } = await supabase.from('comments').delete().eq('id', comment_id);
  if (error) throw error;
  return { ok: true };
}

// ---- 리포트 댓글 조회 (report_id 기준, 비밀 댓글 처리) ----
export async function fetchReportComments(
  report_id: string,
  currentUserId: string,
  reportAuthorId: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('report_id', report_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((comment: any) => {
    if (
      comment.is_secret &&
      comment.author_id !== currentUserId &&
      reportAuthorId !== currentUserId
    ) {
      return { ...comment, content: '비밀 댓글입니다', is_secret: true };
    }
    return comment;
  });
}

// ---- 게시글 댓글 조회 (post_id 기준, 비밀 댓글 처리) ----
export async function fetchPostComments(
  postId: string,
  currentUserId: string,
  postAuthorId: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((comment: any) => {
    if (
      comment.is_secret &&
      comment.user_id !== currentUserId &&
      postAuthorId !== currentUserId
    ) {
      return { ...comment, content: '비밀 댓글입니다', is_secret: true };
    }
    return comment;
  });
}
