"use client";
import { useEffect, useState } from "react";
import { fetchComments, createComment } from "../lib/api/comment";

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

  return (
    <div>
      <h3>댓글</h3>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <span>{c.is_secret ? <b>🔒</b> : null}</span>
            <span>{c.content}</span>
            <small>{new Date(c.created_at).toLocaleString()}</small>
          </li>
        ))}
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
