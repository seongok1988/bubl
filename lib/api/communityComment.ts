import type { CommunityComment } from '@/types/db';

const BASE = '/api/community-comments';

/** 게시글의 댓글 목록 조회 (대댓글 포함 flat list → 클라이언트에서 트리화) */
export async function fetchCommunityComments(
  postId: string,
): Promise<CommunityComment[]> {
  const res = await fetch(`${BASE}?post_id=${postId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** 댓글 생성 (parent_id 지정 시 대댓글) */
export async function createCommunityComment(
  data: {
    post_id: string;
    content: string;
    parent_id?: string;
    is_secret?: boolean;
  },
  token: string,
): Promise<CommunityComment> {
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

/** 댓글 수정 */
export async function updateCommunityComment(
  id: string,
  content: string,
  token: string,
): Promise<CommunityComment> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** 댓글 삭제 (soft delete) */
export async function deleteCommunityComment(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

/** 댓글/대댓글 추천 */
export async function voteCommunityComment(
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

/** flat list → tree 변환 유틸 */
export function buildCommentTree(
  comments: CommunityComment[],
): CommunityComment[] {
  const map = new Map<string, CommunityComment>();
  const roots: CommunityComment[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  map.forEach((c) => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children!.push(c);
    } else {
      roots.push(c);
    }
  });

  return roots;
}
