import type { ReviewReport, ReportReason } from '@/types/db';

const BASE = '/api/reports';

export async function submitReviewReport(
  data: {
    target_survey_id?: string;
    target_review_id?: string;
    reason: ReportReason;
    detail?: string;
    attachment_url?: string;
  },
  token: string,
): Promise<ReviewReport> {
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

export async function fetchMyReports(token: string): Promise<ReviewReport[]> {
  const res = await fetch(`${BASE}?mine=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAllReports(token: string): Promise<ReviewReport[]> {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateReportStatus(
  id: string,
  status: 'reviewed' | 'dismissed' | 'deleted',
  token: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
}
