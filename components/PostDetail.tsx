"use client";
import { useEffect, useState } from "react";
import { fetchPost, updatePost, deletePost } from "../lib/api/post";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Props {
  postId: string;
  currentUserId: string;
}

export default function PostDetail({ postId, currentUserId }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPost(postId);
        if (!mounted) return;
        setPost(data);
        setTitle(data?.title || "");
        setContent(data?.content || "");
      } catch (e: any) {
        setPost(null);
        setError(e.message || 'Failed to load post');
      }
    })();
    return () => { mounted = false };
  }, [postId]);

  if (!post) return <div>로딩 중...</div>;

  const isOwner = post.user_id === currentUserId;

  const handleUpdate = async () => {
    try {
      const updated = await updatePost({ post_id: post.id, title, content });
      setPost(updated);
      setEditMode(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deletePost({ post_id: post.id });
      window.location.href = "/"; // 삭제 후 목록으로 이동
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      {editMode ? (
        <div>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea value={content} onChange={e => setContent(e.target.value)} />
          <button onClick={handleUpdate}>저장</button>
          <button onClick={() => setEditMode(false)}>취소</button>
        </div>
      ) : (
        <>
          <h2>{post.title}</h2>
          <div>{post.content}</div>
          <small>{new Date(post.created_at).toLocaleString()}</small>
          {isOwner && (
            <>
              <button onClick={() => setEditMode(true)}>수정</button>
              <button onClick={handleDelete}>삭제</button>
            </>
          )}
        </>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
