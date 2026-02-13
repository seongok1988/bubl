import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

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
    .from('community_posts')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // admin log
  const actionMap: Record<string, string> = {
    blind: 'blind',
    active: 'unblind',
    deleted: 'delete',
  };
  await admin.from('admin_logs').insert({
    admin_id: user.id,
    action: actionMap[body.status] || 'edit',
    target_type: 'post',
    target_id: id,
    reason: body.reason || null,
  });

  return NextResponse.json(data);
}
