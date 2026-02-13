'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import type { CommentRow } from '@/types/db';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // 댓글 조회
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (!error) setComments((data as CommentRow[]) || []);
    };
    fetchComments();
  }, [postId]);

  // 댓글 작성/수정
  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.id) {
        setSuccessMsg('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      if (editId) {
        // 수정
        const { error } = await supabase
          .from('comments')
          .update({ content: commentText, updated_at: new Date().toISOString() })
          .eq('id', editId)
          .eq('user_id', user.id);
        if (error) {
          setSuccessMsg('댓글 수정 실패');
          setLoading(false);
          return;
        }
        setSuccessMsg('댓글이 수정되었습니다.');
      } else {
        // 등록
        const { error } = await supabase
          .from('comments')
          .insert([{ post_id: postId, user_id: user.id, content: commentText, is_secret: false }])
          .select();
        if (error) {
          setSuccessMsg('댓글 저장 실패');
          setLoading(false);
          return;
        }
        setSuccessMsg('댓글이 등록되었습니다.');
      }

      setCommentText('');
      setEditId(null);

      // 댓글 재조회
      const { data: newComments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      setComments((newComments as CommentRow[]) || []);
    } catch (err) {
      setSuccessMsg('댓글 저장 중 오류 발생');
      console.error('Comment submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!currentUserId) return;
    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUserId);
    setLoading(false);
    if (!error) {
      setSuccessMsg('댓글이 삭제되었습니다.');
      const { data: newComments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      setComments((newComments as CommentRow[]) || []);
    }
  };

  // 댓글 수정 시작
  const handleStartEdit = (comment: CommentRow) => {
    setEditId(comment.id);
    setCommentText(comment.content);
    setSuccessMsg('');
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          id="comment"
          name="comment"
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder={editId ? '댓글을 수정하세요' : '댓글을 입력하세요'}
          disabled={loading}
          style={{ width: '70%' }}
          autoComplete="on"
        />
        <button
          type="button"
          disabled={loading}
          style={{ marginLeft: '1rem' }}
          onClick={handleSubmit}
        >
          {editId ? '수정' : '등록'}
        </button>
      </div>
      {successMsg && <div style={{ color: 'green', marginTop: 8 }}>{successMsg}</div>}
      <ul style={{ marginTop: 16 }}>
        {comments.map((comment) => (
          <li key={comment.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{comment.content}</span>
            {currentUserId && comment.user_id === currentUserId && (
              <>
                <button style={{ marginLeft: 4 }} onClick={() => handleStartEdit(comment)}>수정</button>
                <button style={{ marginLeft: 4 }} onClick={() => handleDelete(comment.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
