import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase-server';
import { createAuthClient } from '@/services/supabase-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const admin = supabaseAdmin;

  const { data, error } = await admin
    .from('review_reports')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 신고 기각 시 블라인드 해제
  if (body.status === 'dismissed' && data.target_survey_id) {
    await admin
      .from('reputation_surveys')
      .update({ status: 'active' })
      .eq('id', data.target_survey_id);
  }

  // admin log
  await admin.from('admin_logs').insert({
    admin_id: user.id,
    action: body.status === 'dismissed' ? 'dismiss' : body.status === 'deleted' ? 'delete' : 'blind',
    target_type: 'report',
    target_id: id,
    reason: body.reason || null,
  });

  return NextResponse.json(data);
}
