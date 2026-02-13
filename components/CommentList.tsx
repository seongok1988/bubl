"use client";
import { useEffect, useState } from "react";
import { fetchPostComments, createComment, updateComment, deleteComment } from "@/lib/api/comment";

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
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSecret, setEditSecret] = useState(false);
  // 실제 API 함수 import 필요
  // import { updateComment, deleteComment } from '../lib/api/comment';

  const load = () => {
    fetchPostComments(postId, currentUserId, postAuthorId)
      .then(setComments)
      .catch((e: any) => setError(e.message));
  };

  useEffect(() => { load(); }, [postId, currentUserId, postAuthorId]);

  const handleSubmit = async () => {
    try {
      const result = await createComment({ post_id: postId, content: input, is_secret: isSecret });
      console.log('insert 결과:', result);
      setInput("");
      setIsSecret(false);
      load();
    } catch (e: any) {
      setError(e.message);
      console.log('insert 결과:', null, e);
    }
  };

  return (
    <div>
      <h3>댓글</h3>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <span>{c.is_secret ? <b>🔒</b> : null}</span>
            {editId === c.id ? (
              <>
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} />
                <label>
                  <input type="checkbox" checked={editSecret} onChange={e => setEditSecret(e.target.checked)} /> 비밀댓글
                </label>
                <button onClick={async () => {
                  try {
                    await updateComment({ comment_id: c.id, content: editContent, is_secret: editSecret });
                    setEditId(null);
                    setEditContent("");
                    setEditSecret(false);
                    load();
                  } catch (e: any) {
                    setError(e.message);
                  }
                }}>저장</button>
                <button onClick={() => setEditId(null)}>취소</button>
              </>
            ) : (
              <>
                <span>{c.content}</span>
                <small>{new Date(c.created_at).toLocaleString()}</small>
                {c.user_id === currentUserId && (
                  <>
                    <button onClick={() => {
                      setEditId(c.id);
                      setEditContent(c.content);
                      setEditSecret(!!c.is_secret);
                    }}>수정</button>
                    <button onClick={async () => {
                      if (!window.confirm("정말 삭제하시겠습니까?")) return;
                      try {
                        await deleteComment({ comment_id: c.id });
                        load();
                      } catch (e: any) {
                        setError(e.message);
                      }
                    }}>삭제</button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="댓글을 입력하세요" />
        <label>
          <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} /> 비밀댓글
        </label>
        <button type="button" onClick={handleSubmit}>댓글 작성</button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
