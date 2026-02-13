'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBell,
  FaClipboardList,
  FaRegCommentDots,
  FaExclamationTriangle,
  FaTrash,
  FaCheck,
  FaChevronLeft,
} from 'react-icons/fa';
import { supabase } from '@/services/supabase';
import type { Notification as NotificationRow, CommunityPost, ReviewReport } from '@/types/db';
import { fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/lib/api/notification';
import { fetchMyReports } from '@/lib/api/report';
import Header from '@/components/Header';
import { useAutoLogout } from '@/lib/hooks/useAutoLogout';

type Tab = 'posts' | 'reports' | 'notifications';

export default function MyPage() {
  useAutoLogout();
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('posts');
  const [loading, setLoading] = useState(false);

  // 데이터
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [myReports, setMyReports] = useState<ReviewReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const t = data.session?.access_token ?? '';
      setToken(t);
      setUserId(data.session?.user?.id);
      if (t) loadUnreadCount(t);
    });
  }, []);

  const loadUnreadCount = async (t: string) => {
    try {
      const count = await getUnreadCount(t);
      setUnreadCount(count);
    } catch (e) {
      console.error(e);
    }
  };

  // 내 게시글
  const loadMyPosts = useCallback(async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community-posts?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMyPosts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  // 내 신고
  const loadMyReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchMyReports(token);
      setMyReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 알림
  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchNotifications(token);
      setNotifications(data);
      loadUnreadCount(token);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'posts') loadMyPosts();
    else if (tab === 'reports') loadMyReports();
    else loadNotifications();
  }, [tab, token, loadMyPosts, loadMyReports, loadNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    await markAsRead(id, token);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await markAllAsRead(token);
    loadNotifications();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      blind: 'bg-amber-100 text-amber-700',
      deleted: 'bg-red-100 text-red-700',
      pending: 'bg-blue-100 text-blue-700',
      reviewed: 'bg-purple-100 text-purple-700',
      dismissed: 'bg-gray-100 text-gray-700',
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}
      >
        {status}
      </span>
    );
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'posts', label: '내 게시글', icon: <FaRegCommentDots /> },
    { key: 'reports', label: '내 신고', icon: <FaExclamationTriangle /> },
    { key: 'notifications', label: '알림', icon: <FaBell />, badge: unreadCount },
  ];

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-navy-50">
        <Header onLogoClick={() => (window.location.href = '/')} onLoginClick={() => window.dispatchEvent(new CustomEvent('bubl:open-login'))} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="mb-4 text-lg text-gray-500">로그인이 필요합니다.</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bubl:open-login'))}
              className="rounded-xl bg-accent px-6 py-3 font-bold text-white hover:bg-accent-dark transition"
            >
              로그인하기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-navy-50">
      <Header onLogoClick={() => (window.location.href = '/')} onLoginClick={() => {}} />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => (window.location.href = '/')}
          className="mb-6 flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition"
        >
          <FaChevronLeft /> 홈으로
        </button>

        <h1 className="mb-6 text-2xl font-bold text-navy-900">마이페이지</h1>

        {/* 탭 */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {tabs.map(({ key, label, icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon} {label}
              {badge !== undefined && badge > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        )}

        {/* 내 게시글 */}
        {!loading && tab === 'posts' && (
          <div className="space-y-3">
            {myPosts.length === 0 ? (
              <p className="py-12 text-center text-gray-400">작성한 게시글이 없습니다.</p>
            ) : (
              myPosts.map((p) => (
                <div key={p.id} className="card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.category === '경험담'
                              ? 'bg-blue-100 text-blue-700'
                              : p.category === '질문'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {p.category}
                        </span>
                        {statusBadge(p.status)}
                      </div>
                      <h4 className="font-semibold text-navy-900">{p.title}</h4>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500">{p.content}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 내 신고 */}
        {!loading && tab === 'reports' && (
          <div className="space-y-3">
            {myReports.length === 0 ? (
              <p className="py-12 text-center text-gray-400">접수한 신고가 없습니다.</p>
            ) : (
              myReports.map((r) => (
                <div key={r.id} className="card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-400" />
                        <span className="text-sm font-semibold text-navy-800">{r.reason}</span>
                        {statusBadge(r.status)}
                      </div>
                      <p className="text-sm text-gray-500">{r.detail || '상세 내용 없음'}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 알림 */}
        {!loading && tab === 'notifications' && (
          <div>
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <FaCheck /> 모두 읽음 처리
                </button>
              </div>
            )}
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="py-12 text-center text-gray-400">알림이 없습니다.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`card w-full rounded-xl p-4 text-left transition ${
                      n.is_read ? 'opacity-60' : 'border-l-4 border-l-accent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-navy-900">{n.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(n.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 계정 삭제 */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-500">계정 관리</h3>
          <button
            onClick={async () => {
              if (
                !confirm(
                  '정말 계정을 삭제하시겠습니까?\n삭제 후에는 작성하신 게시글과 댓글이 모두 비공개 처리됩니다.\n이 작업은 되돌릴 수 없습니다.',
                )
              )
                return;
              try {
                const res = await fetch('/api/account', {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(await res.text());
                await supabase.auth.signOut();
                alert('계정이 삭제되었습니다.');
                window.location.href = '/';
              } catch (e) {
                console.error(e);
                alert('계정 삭제에 실패했습니다.');
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
          >
            <FaTrash /> 계정 삭제
          </button>
          <p className="mt-2 text-xs text-gray-400">
            계정 삭제 시 작성한 게시글과 댓글은 비공개(soft delete) 처리되며, 닉네임은 &quot;탈퇴한 사용자&quot;로 변경됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
