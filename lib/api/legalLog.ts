import type { LegalLog } from '@/types/db';
import { LEGAL_DISCLAIMER_TEXT } from '@/types/db';

const BASE = '/api/legal-logs';

export async function createLegalLog(
  data: { survey_id?: string },
  token: string,
): Promise<LegalLog> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...data,
      disclaimer_text: LEGAL_DISCLAIMER_TEXT,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
