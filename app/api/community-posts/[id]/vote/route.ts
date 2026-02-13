import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

export async function POST(
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

  // 기존 투표 확인
  const { data: existing } = await admin
    .from('community_votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_type', 'post')
    .eq('target_id', id)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === body.vote_type) {
      // 동일한 투표 → 취소
      await admin.from('community_votes').delete().eq('id', existing.id);
      const decField = body.vote_type === 'up' ? 'likes' : 'dislikes';
      await admin.rpc('decrement_field', {
        table_name: 'community_posts',
        field_name: decField,
        row_id: id,
      });
    } else {
      // 다른 투표 → 변경
      await admin
        .from('community_votes')
        .update({ vote_type: body.vote_type })
        .eq('id', existing.id);
      const incField = body.vote_type === 'up' ? 'likes' : 'dislikes';
      const decField = body.vote_type === 'up' ? 'dislikes' : 'likes';
      await admin.rpc('decrement_field', {
        table_name: 'community_posts',
        field_name: decField,
        row_id: id,
      });
      await admin.rpc('increment_field', {
        table_name: 'community_posts',
        field_name: incField,
        row_id: id,
      });
    }
  } else {
    // 새 투표
    await admin.from('community_votes').insert({
      user_id: user.id,
      target_type: 'post',
      target_id: id,
      vote_type: body.vote_type,
    });
    const incField = body.vote_type === 'up' ? 'likes' : 'dislikes';
    await admin.rpc('increment_field', {
      table_name: 'community_posts',
      field_name: incField,
      row_id: id,
    });
  }

  // 최신 집계 반환
  const { data: post } = await admin
    .from('community_posts')
    .select('likes, dislikes')
    .eq('id', id)
    .single();

  return NextResponse.json({
    likes: post?.likes ?? 0,
    dislikes: post?.dislikes ?? 0,
  });
}
