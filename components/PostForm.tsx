"use client";
import { useState } from "react";
import { createPost } from "../lib/api/post";

interface Props {
  communityId: string;
  userId: string;
  onSuccess?: () => void;
}

export default function PostForm({ communityId, userId, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await createPost({ community_id: communityId, title, content });
      setTitle("");
      setContent("");
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h3>글쓰기</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용" />
      <button onClick={handleSubmit}>등록</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
