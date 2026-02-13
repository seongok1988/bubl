'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaClipboardList,
  FaExclamationTriangle,
  FaUsers,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import { supabase } from '@/services/supabase';
import type { ReviewReport, CommunityPost } from '@/types/db';

type Tab = 'surveys' | 'reports' | 'community';

interface SurveyRow {
  id: string;
  user_id: string;
  address: string;
  review_content: string;
  status: string;
  created_at: string;
  user_profiles?: { nickname?: string };
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('surveys');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // 데이터
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? '');
    });
  }, []);

  // ===== 설문 관리 =====
  const loadSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/surveys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSurveys(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ===== 신고 관리 =====
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReports(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ===== 커뮤니티 관리 =====
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/community', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPosts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'surveys') loadSurveys();
    else if (tab === 'reports') loadReports();
    else loadPosts();
  }, [tab, token, loadSurveys, loadReports, loadPosts]);

  // ===== 관리 액션 =====
  const adminAction = async (
    endpoint: string,
    method: string,
    body?: object,
  ) => {
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      // 리로드
      if (tab === 'surveys') loadSurveys();
      else if (tab === 'reports') loadReports();
      else loadPosts();
    } catch (e) {
      console.error('관리 액션 실패:', e);
      alert('작업에 실패했습니다.');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'surveys', label: '설문 관리', icon: <FaClipboardList /> },
    { key: 'reports', label: '신고 관리', icon: <FaExclamationTriangle /> },
    { key: 'community', label: '커뮤니티 관리', icon: <FaUsers /> },
  ];

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

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">관리자 대시보드</h1>

      {/* 탭 */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      )}

      {/* ===== 설문 관리 ===== */}
      {!loading && tab === 'surveys' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">주소</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{s.user_profiles?.nickname || '익명'}</td>
                  <td className="max-w-[200px] truncate px-4 py-3">{s.address}</td>
                  <td className="max-w-[300px] truncate px-4 py-3">{s.review_content}</td>
                  <td className="px-4 py-3">{statusBadge(s.status)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.status === 'active' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/surveys/${s.id}`, 'PATCH', {
                              status: 'blind',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 hover:bg-amber-200"
                          title="블라인드"
                        >
                          <FaEyeSlash /> 블라인드
                        </button>
                      )}
                      {s.status === 'blind' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/surveys/${s.id}`, 'PATCH', {
                              status: 'active',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                          title="블라인드 해제"
                        >
                          <FaEye /> 해제
                        </button>
                      )}
                      {s.status !== 'deleted' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/surveys/${s.id}`, 'PATCH', {
                              status: 'deleted',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                          title="삭제"
                        >
                          <FaTrash /> 삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {surveys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    설문 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== 신고 관리 ===== */}
      {!loading && tab === 'reports' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3">신고자</th>
                <th className="px-4 py-3">사유</th>
                <th className="px-4 py-3">상세</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">접수일</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{r.user_profiles?.nickname || '익명'}</td>
                  <td className="px-4 py-3">{r.reason}</td>
                  <td className="max-w-[300px] truncate px-4 py-3">{r.detail || '-'}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              adminAction(`/api/reports/${r.id}`, 'PATCH', {
                                status: 'reviewed',
                              })
                            }
                            className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200"
                          >
                            검토완료
                          </button>
                          <button
                            onClick={() =>
                              adminAction(`/api/reports/${r.id}`, 'PATCH', {
                                status: 'dismissed',
                              })
                            }
                            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                          >
                            <FaUndo /> 기각
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    신고 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== 커뮤니티 관리 ===== */}
      {!loading && tab === 'community' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">좋아요</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{p.user_profiles?.nickname || '익명'}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="max-w-[300px] truncate px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3">{p.likes}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status === 'active' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/community/${p.id}`, 'PATCH', {
                              status: 'blind',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 hover:bg-amber-200"
                        >
                          <FaEyeSlash /> 블라인드
                        </button>
                      )}
                      {p.status === 'blind' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/community/${p.id}`, 'PATCH', {
                              status: 'active',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                        >
                          <FaEye /> 해제
                        </button>
                      )}
                      {p.status !== 'deleted' && (
                        <button
                          onClick={() =>
                            adminAction(`/api/admin/community/${p.id}`, 'PATCH', {
                              status: 'deleted',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                        >
                          <FaTrash /> 삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    게시글 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
