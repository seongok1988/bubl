import type { Notification } from '@/types/db';

const BASE = '/api/notifications';

export async function fetchNotifications(
  token: string,
): Promise<Notification[]> {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUnreadCount(token: string): Promise<number> {
  const res = await fetch(`${BASE}/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.count;
}

export async function markAsRead(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function markAllAsRead(token: string): Promise<void> {
  const res = await fetch(`${BASE}/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
