import type { CommunityPost } from '@/types/db';

const BASE = '/api/community-posts';

export async function fetchCommunityPosts(params?: {
  category?: string;
  sort?: 'recent' | 'popular';
  limit?: number;
  offset?: number;
}): Promise<CommunityPost[]> {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.sort) q.set('sort', params.sort);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  const res = await fetch(`${BASE}?${q.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCommunityPostById(
  id: string,
): Promise<CommunityPost> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCommunityPost(
  data: { title: string; content: string; category: string },
  token: string,
): Promise<CommunityPost> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCommunityPost(
  id: string,
  data: { title?: string; content?: string; category?: string },
  token: string,
): Promise<CommunityPost> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCommunityPost(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function voteCommunityPost(
  id: string,
  voteType: 'up' | 'down',
  token: string,
): Promise<{ likes: number; dislikes: number }> {
  const res = await fetch(`${BASE}/${id}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ vote_type: voteType }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
