import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

/** 소프트 삭제: user_profiles status → 'deleted', 닉네임 익명화 */
export async function DELETE(req: NextRequest) {
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = supabaseAdmin;

  // 1. user_profiles 소프트 삭제
  await admin
    .from('user_profiles')
    .update({
      status: 'deleted',
      nickname: '탈퇴한 사용자',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // 2. community_posts 소프트 삭제
  await admin
    .from('community_posts')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  // 3. community_comments 소프트 삭제
  await admin
    .from('community_comments')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  // 4. admin log
  await admin.from('admin_logs').insert({
    admin_id: user.id,
    action: 'delete',
    target_type: 'survey',
    target_id: user.id,
    reason: '사용자 자발적 계정 삭제',
  });

  return NextResponse.json({ success: true });
}
