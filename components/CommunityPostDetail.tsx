'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaThumbsUp, FaThumbsDown, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import type { CommunityPost, CommunityComment } from '@/types/db';
import { fetchCommunityPostById, voteCommunityPost, deleteCommunityPost } from '@/lib/api/communityPost';
import { fetchCommunityComments, createCommunityComment, buildCommentTree } from '@/lib/api/communityComment';
import CommunityCommentTree from './CommunityCommentTree';

interface CommunityPostDetailProps {
  postId: string;
  currentUserId?: string;
  token: string;
  onBack: () => void;
  onReport: (postId: string) => void;
}

export default function CommunityPostDetail({
  postId,
  currentUserId,
  token,
  onBack,
  onReport,
}: CommunityPostDetailProps) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    try {
      const data = await fetchCommunityPostById(postId);
      setPost(data);
    } catch (e) {
      console.error('게시글 불러오기 실패:', e);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    try {
      const data = await fetchCommunityComments(postId);
      setComments(buildCommentTree(data));
    } catch (e) {
      console.error('댓글 불러오기 실패:', e);
    }
  }, [postId]);

  useEffect(() => {
    Promise.all([loadPost(), loadComments()]).finally(() => setLoading(false));
  }, [loadPost, loadComments]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!token) return;
    try {
      const result = await voteCommunityPost(postId, voteType, token);
      setPost((prev) => (prev ? { ...prev, ...result } : prev));
    } catch (e) {
      console.error('투표 실패:', e);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?') || !token) return;
    try {
      await deleteCommunityPost(postId, token);
      onBack();
    } catch (e) {
      console.error('삭제 실패:', e);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !token) return;
    try {
      await createCommunityComment(
        { post_id: postId, content: newComment, is_secret: isSecret },
        token,
      );
      setNewComment('');
      setIsSecret(false);
      loadComments();
    } catch (e) {
      console.error('댓글 등록 실패:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
        <button onClick={onBack} className="mt-4 text-sm text-accent hover:underline">
          뒤로가기
        </button>
      </div>
    );
  }

  const isMine = currentUserId === post.user_id;
  const nickname = post.user_profiles?.nickname || '익명';
  const categoryColors: Record<string, string> = {
    경험담: 'bg-blue-100 text-blue-700',
    질문: 'bg-green-100 text-green-700',
    주의사항: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition"
      >
        <FaArrowLeft /> 목록으로
      </button>

      {/* 게시글 본문 */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}
            >
              {post.category}
            </span>
            <h2 className="text-lg font-bold text-navy-900">{post.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isMine && (
              <button
                onClick={handleDeletePost}
                className="text-xs text-red-400 hover:text-red-600"
              >
                삭제
              </button>
            )}
            {!isMine && token && (
              <button
                onClick={() => onReport(post.id)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
              >
                <FaExclamationTriangle /> 신고
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-navy-700">{nickname}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
        </div>

        <div className="mb-6 whitespace-pre-wrap text-navy-800 leading-relaxed">
          {post.content}
        </div>

        {/* 투표 */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
          <button
            onClick={() => handleVote('up')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-accent transition"
          >
            <FaThumbsUp /> <span>{post.likes}</span>
          </button>
          <button
            onClick={() => handleVote('down')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-accent transition"
          >
            <FaThumbsDown /> <span>{post.dislikes}</span>
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="card">
        <h3 className="mb-4 text-base font-bold text-navy-900">
          댓글 {comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)}개
        </h3>

        {/* 댓글 입력 */}
        {token && (
          <div className="mb-6 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-accent focus:outline-none transition"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                />
                <FaLock className="text-amber-500" /> 비밀 댓글
              </label>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-50 transition"
              >
                등록
              </button>
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        {comments.length > 0 ? (
          <CommunityCommentTree
            comments={comments}
            postId={postId}
            currentUserId={currentUserId}
            token={token}
            onRefresh={loadComments}
          />
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">
            아직 댓글이 없습니다. 첫 댓글을 작성해 보세요!
          </p>
        )}
      </div>
    </div>
  );
}
