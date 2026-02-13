'use client';

import React, { useState } from 'react';
import { FaReply, FaThumbsUp, FaThumbsDown, FaLock } from 'react-icons/fa';
import type { CommunityComment } from '@/types/db';
import {
  createCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
  voteCommunityComment,
} from '@/lib/api/communityComment';

interface CommunityCommentTreeProps {
  comments: CommunityComment[];
  postId: string;
  currentUserId?: string;
  token: string;
  onRefresh: () => void;
  depth?: number;
}

export default function CommunityCommentTree({
  comments,
  postId,
  currentUserId,
  token,
  onRefresh,
  depth = 0,
}: CommunityCommentTreeProps) {
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySecret, setReplySecret] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim() || !token) return;
    setLoading(true);
    try {
      await createCommunityComment(
        { post_id: postId, content: replyContent, parent_id: parentId, is_secret: replySecret },
        token,
      );
      setReplyContent('');
      setReplySecret(false);
      setReplyOpenId(null);
      onRefresh();
    } catch (e) {
      console.error('답글 등록 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim() || !token) return;
    setLoading(true);
    try {
      await updateCommunityComment(id, editContent, token);
      setEditingId(null);
      onRefresh();
    } catch (e) {
      console.error('댓글 수정 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteCommunityComment(id, token);
      onRefresh();
    } catch (e) {
      console.error('댓글 삭제 실패:', e);
    }
  };

  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    if (!token) return;
    try {
      await voteCommunityComment(id, voteType, token);
      onRefresh();
    } catch (e) {
      console.error('투표 실패:', e);
    }
  };

  const maxDepth = 5;

  return (
    <div className={depth > 0 ? 'ml-4 border-l-2 border-gray-100 pl-4' : ''}>
      {comments.map((comment) => {
        const isMine = currentUserId === comment.user_id;
        const isSecret = comment.is_secret;
        const canSee = !isSecret || isMine;
        const nickname = comment.user_profiles?.nickname || '익명';
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} className="mb-3">
            <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-3">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isSecret && <FaLock className="text-amber-500" />}
                  <span className="font-semibold text-navy-700">{nickname}</span>
                  <span>·</span>
                  <span>{new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                {isMine && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-navy-500 hover:text-accent"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 내용 */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-lg border p-2 text-sm focus:border-accent focus:outline-none"
                    rows={2}
                  />
                  <div className="mt-1 flex gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={loading}
                      className="rounded bg-navy-600 px-3 py-1 text-xs text-white hover:bg-navy-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded border px-3 py-1 text-xs text-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${canSee ? 'text-navy-800' : 'text-gray-400 italic'}`}>
                  {canSee ? comment.content : '비밀 댓글입니다.'}
                </p>
              )}

              {/* 액션 */}
              {canSee && !isEditing && (
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <button
                    onClick={() => handleVote(comment.id, 'up')}
                    className="flex items-center gap-1 text-gray-500 hover:text-accent"
                  >
                    <FaThumbsUp /> {comment.likes}
                  </button>
                  <button
                    onClick={() => handleVote(comment.id, 'down')}
                    className="flex items-center gap-1 text-gray-500 hover:text-accent"
                  >
                    <FaThumbsDown /> {comment.dislikes}
                  </button>
                  {depth < maxDepth && token && (
                    <button
                      onClick={() =>
                        setReplyOpenId(replyOpenId === comment.id ? null : comment.id)
                      }
                      className="flex items-center gap-1 text-gray-500 hover:text-accent"
                    >
                      <FaReply /> 답글
                    </button>
                  )}
                </div>
              )}

              {/* 답글 작성 */}
              {replyOpenId === comment.id && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 작성하세요"
                    className="w-full rounded-lg border p-2 text-sm focus:border-accent focus:outline-none"
                    rows={2}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={replySecret}
                        onChange={(e) => setReplySecret(e.target.checked)}
                      />
                      비밀 답글
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={loading || !replyContent.trim()}
                        className="rounded bg-navy-600 px-3 py-1 text-xs text-white hover:bg-navy-700 disabled:opacity-50"
                      >
                        등록
                      </button>
                      <button
                        onClick={() => setReplyOpenId(null)}
                        className="rounded border px-3 py-1 text-xs text-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 대댓글 재귀 렌더링 */}
            {comment.children && comment.children.length > 0 && (
              <CommunityCommentTree
                comments={comment.children}
                postId={postId}
                currentUserId={currentUserId}
                token={token}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
