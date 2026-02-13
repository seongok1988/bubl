'use client';

import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { REPORT_REASONS } from '@/types/db';
import type { ReportReason } from '@/types/db';
import { submitReviewReport } from '@/lib/api/report';

interface ReportModalProps {
  targetSurveyId?: string;
  targetReviewId?: string;
  onClose: () => void;
  onSubmitted: () => void;
  token: string;
}

export default function ReportModal({
  targetSurveyId,
  targetReviewId,
  onClose,
  onSubmitted,
  token,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [detail, setDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError('신고 사유를 선택해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitReviewReport(
        {
          target_survey_id: targetSurveyId,
          target_review_id: targetReviewId,
          reason,
          detail: detail.trim() || undefined,
        },
        token,
      );
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '신고에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <FaExclamationTriangle className="text-lg" />
            <h3 className="text-lg font-bold">리뷰 신고하기</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {success ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
            <p className="mb-1 font-semibold">신고가 접수되었습니다.</p>
            <p>
              주소와 함께 신고를 접수하였습니다. 확인을 통해 30일간 해당 리뷰와
              점수는 블라인드 처리되며, 비방/욕설 등이 확인되면 삭제 처리됩니다.
              단, 확인된 내용이 없을 경우 해당 게시물은 다시 보입니다.
            </p>
          </div>
        ) : (
          <>
            {/* 신고 사유 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                신고 사유 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition hover:border-accent"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="text-accent"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 상세 내용 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                상세 내용 (선택)
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="신고 사유를 상세히 작성해 주세요."
                className="w-full rounded-lg border p-3 text-sm focus:border-accent focus:outline-none"
                rows={3}
              />
            </div>

            {error && (
              <p className="mb-3 text-sm text-red-500">{error}</p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '접수 중...' : '신고하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
