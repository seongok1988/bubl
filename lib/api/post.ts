import { supabase } from '../supabase'

// 게시글 목록 조회 (서버 API 사용)
export async function fetchPosts(communityId: string) {
  const res = await fetch(`/api/posts?communityId=${encodeURIComponent(communityId)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch posts')
  }
  return res.json()
}

// 게시글 작성 (서버 엔드포인트를 통해 생성)
export async function createPost({ community_id, title, content }: { community_id: string; title: string; content: string }) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ community_id, title, content }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error || 'Failed to create post')
  return payload
}

// 게시글 수정
export async function updatePost({ post_id, title, content }: { post_id: string; title: string; content: string }) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`/api/posts/${encodeURIComponent(post_id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, content }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error || 'Failed to update post')
  return payload
}

// 게시글 삭제
export async function deletePost({ post_id }: { post_id: string }) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`/api/posts/${encodeURIComponent(post_id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error || 'Failed to delete post')
  return payload
}
