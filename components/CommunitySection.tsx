'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaPlus,
  FaRegCommentDots,
  FaThumbsUp,
  FaExclamationTriangle,
  FaFire,
  FaClock,
  FaRegComment,
} from 'react-icons/fa';
import { supabase } from '@/services/supabase';
import type { CommunityPost, ReportReason } from '@/types/db';
import { fetchCommunityPosts, createCommunityPost } from '@/lib/api/communityPost';
import CommunityPostDetail from './CommunityPostDetail';
import ReportModal from './ReportModal';

type ViewMode = 'list' | 'detail';

export default function CommunitySection() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState('전체');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formCategory, setFormCategory] = useState<'경험담' | '질문' | '주의사항'>('경험담');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  const categories = ['전체', '경험담', '질문', '주의사항'];

  const categoryColors: Record<string, { active: string; inactive: string }> = {
    경험담: {
      active: 'bg-blue-100 text-blue-900 border-blue-200',
      inactive: 'bg-blue-50 text-blue-700 border-blue-50 hover:border-blue-200',
    },
    질문: {
      active: 'bg-green-100 text-green-900 border-green-200',
      inactive: 'bg-green-50 text-green-700 border-green-50 hover:border-green-200',
    },
    주의사항: {
      active: 'bg-red-100 text-red-900 border-red-200',
      inactive: 'bg-red-50 text-red-700 border-red-50 hover:border-red-200',
    },
  };

  // 인증 정보 로드
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? '');
      setUserId(data.session?.user?.id);
    });
  }, []);

  // 게시글 로드
  const loadPosts = useCallback(async () => {
    try {
      const cat = category === '전체' ? undefined : category;
      const [recent, popular] = await Promise.all([
        fetchCommunityPosts({ category: cat, sort: 'recent', limit: 7 }),
        fetchCommunityPosts({ category: cat, sort: 'popular', limit: 3 }),
      ]);
      setPosts(recent);
      setPopularPosts(popular);
    } catch (e) {
      console.error('게시글 로드 실패:', e);
    }
  }, [category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 게시글 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      window.dispatchEvent(new CustomEvent('bubl:open-login'));
      return;
    }
    setLoading(true);
    try {
      await createCommunityPost(
        { title, content, category: formCategory },
        token,
      );
      setTitle('');
      setContent('');
      setShowForm(false);
      loadPosts();
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 상세보기
  const openDetail = (postId: string) => {
    setSelectedPostId(postId);
    setViewMode('detail');
  };

  // 상세에서 돌아오기
  const backToList = () => {
    setViewMode('list');
    setSelectedPostId(null);
    loadPosts();
  };

  // 상세보기 모드
  if (viewMode === 'detail' && selectedPostId) {
    return (
      <section className="mx-auto max-w-4xl p-6">
        <CommunityPostDetail
          postId={selectedPostId}
          currentUserId={userId}
          token={token}
          onBack={backToList}
          onReport={(id) => setReportPostId(id)}
        />
        {reportPostId && token && (
          <ReportModal
            targetSurveyId={reportPostId}
            token={token}
            onClose={() => setReportPostId(null)}
            onSubmitted={() => {
              setReportPostId(null);
              backToList();
            }}
          />
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl p-6">
      {/* 상단 소개글 */}
      <div className="m-0 p-0 text-center">
        <h2
          className="mb-3 text-3xl font-bold text-accent-dark md:text-4xl"
          style={{ fontFamily: 'Unbounded, sans-serif' }}
        >
          부동산의 모든 이야기가 모이는 공간
        </h2>
        <p className="text-lg leading-relaxed text-navy-500 md:text-xl">
          묻고, 나누고, 함께 성장합니다.
          <br />
          부블 커뮤니티에서 경험과 인사이트를 나누세요.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 mt-4 flex justify-center gap-2">
        {categories.map((cat) => {
          const isActive = category === cat;
          let colorClass = isActive
            ? 'bg-accent/20 text-accent-dark border-accent/30'
            : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-accent/20';
          if (cat !== '전체' && categoryColors[cat]) {
            colorClass = isActive
              ? categoryColors[cat].active
              : categoryColors[cat].inactive;
          }
          return (
            <button
              key={cat}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm transition-all ${colorClass} ${isActive ? 'scale-105 shadow-lg' : ''}`}
              onClick={() => setCategory(cat)}
              style={{ minWidth: 70 }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="mb-8 flex justify-center">
        <button
          className="flex w-full max-w-3xl items-center justify-center gap-3 rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent-dark py-2.5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl md:text-xl"
          onClick={() => {
            if (!token) {
              window.dispatchEvent(new CustomEvent('bubl:open-login'));
              return;
            }
            setShowForm(true);
          }}
        >
          <FaPlus className="text-xl md:text-2xl" />
          <span>글쓰기</span>
        </button>
      </div>

      {/* 글쓰기 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <h4 className="mb-4 text-xl font-bold">새 게시글 작성</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 카테고리 선택 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  카테고리
                </label>
                <div className="flex gap-2">
                  {(['경험담', '질문', '주의사항'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                        formCategory === cat
                          ? categoryColors[cat]?.active || ''
                          : categoryColors[cat]?.inactive || ''
                      }`}
                      onClick={() => setFormCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className="w-full rounded-xl border p-3"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
              <textarea
                className="w-full resize-none rounded-xl border p-3"
                rows={6}
                placeholder="내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={10000}
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-gray-200 px-4 py-2 font-semibold"
                  onClick={() => setShowForm(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-accent to-accent-dark px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
                >
                  {loading ? '작성중...' : '게시하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 인기 게시글 (상위 3개) */}
      {popularPosts.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            <h3 className="text-lg font-bold text-navy-900">인기글</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {popularPosts.map((post) => (
              <button
                key={post.id}
                className="card rounded-2xl bg-white p-5 text-left shadow-lg transition hover:shadow-xl"
                onClick={() => openDetail(post.id)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      categoryColors[post.category]?.active ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-orange-500">
                    <FaThumbsUp /> {post.likes}
                  </span>
                </div>
                <h5 className="mb-1 line-clamp-1 font-bold text-navy-900">
                  {post.title}
                </h5>
                <p className="line-clamp-2 text-sm text-navy-600">
                  {post.content}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.user_profiles?.nickname || '익명'}</span>
                  <span>·</span>
                  <span>
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {typeof post.comment_count === 'number' && post.comment_count > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FaRegComment /> {post.comment_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 최근 게시글 */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <FaClock className="text-navy-400" />
          <h3 className="text-lg font-bold text-navy-900">최근글</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {posts.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-navy-400">
              <FaRegCommentDots className="mx-auto mb-2 text-4xl" />
              아직 게시글이 없습니다.
            </div>
          ) : (
            posts.map((post) => (
              <button
                key={post.id}
                className="card group rounded-2xl bg-white p-6 text-left shadow-lg transition hover:shadow-xl"
                onClick={() => openDetail(post.id)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      categoryColors[post.category]?.active ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-navy-400">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <h5 className="mb-2 text-lg font-bold text-navy-900 transition group-hover:text-accent-dark">
                  {post.title}
                </h5>
                <p className="mb-4 line-clamp-3 text-navy-700">{post.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{post.user_profiles?.nickname || '익명'}</span>
                  <span className="flex items-center gap-1">
                    <FaThumbsUp /> {post.likes}
                  </span>
                  {typeof post.comment_count === 'number' && post.comment_count > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FaRegComment /> {post.comment_count}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}