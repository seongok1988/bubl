"use client";
import { useEffect, useState } from "react";
import { fetchComments, createComment } from "../lib/api/comment";
import { supabase } from "../lib/supabase";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  is_secret?: boolean;
  created_at: string;
}

interface Props {
  postId: string;
  currentUserId: string;
  postAuthorId: string;
}

export default function CommentList({ postId, currentUserId, postAuthorId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>("")

  const load = () => {
    fetchComments(postId, currentUserId, postAuthorId)
      .then(setComments)
      .catch(e => setError(e.message));
  };

  useEffect(() => { load(); }, [postId, currentUserId, postAuthorId]);

  const handleSubmit = async () => {
    try {
      await createComment({ post_id: postId, user_id: currentUserId, content: input, is_secret: isSecret });
      setInput("");
      setIsSecret(false);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleStartEdit = (c: Comment) => {
    setEditingId(c.id)
    setEditingText((c as any).content || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('로그인되어 있지 않습니다.')
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, content: editingText })
      })
      if (!res.ok) throw new Error(await res.text())
      await load()
      handleCancelEdit()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('로그인되어 있지 않습니다.')
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h3>댓글</h3>
      <ul>
        {comments.map((c) => {
          const authorId = (c as any).author_id || (c as any).user_id || null
          const isMine = !!authorId && String(authorId) === String(currentUserId)
          return (
          <li key={c.id} style={{ marginBottom: 8 }}>
            <span>{c.is_secret ? <b>🔒</b> : null}</span>
            {editingId === c.id ? (
              <div>
                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} />
                <div>
                  <button onClick={() => handleSaveEdit(c.id)}>저장</button>
                  <button onClick={handleCancelEdit}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <span style={{ marginLeft: 6 }}>{(c as any).content}</span>
                <small style={{ marginLeft: 8 }}>{new Date(c.created_at).toLocaleString()}</small>
              </>
            )}
            {isMine && editingId !== c.id && (
              <span style={{ marginLeft: 10 }}>
                <button onClick={() => handleStartEdit(c)}>수정</button>
                <button style={{ marginLeft: 6, color: 'red' }} onClick={() => handleDelete(c.id)}>삭제</button>
              </span>
            )}
          </li>
        )})}
      </ul>
      <div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="댓글을 입력하세요" />
        <label>
          <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} /> 비밀댓글
        </label>
        <button onClick={handleSubmit}>댓글 작성</button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
