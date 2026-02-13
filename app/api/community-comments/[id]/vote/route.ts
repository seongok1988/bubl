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
    .eq('target_type', 'comment')
    .eq('target_id', id)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === body.vote_type) {
      await admin.from('community_votes').delete().eq('id', existing.id);
      const decField = body.vote_type === 'up' ? 'likes' : 'dislikes';
      await admin.rpc('decrement_field', {
        table_name: 'community_comments',
        field_name: decField,
        row_id: id,
      });
    } else {
      await admin
        .from('community_votes')
        .update({ vote_type: body.vote_type })
        .eq('id', existing.id);
      const incField = body.vote_type === 'up' ? 'likes' : 'dislikes';
      const decField = body.vote_type === 'up' ? 'dislikes' : 'likes';
      await admin.rpc('decrement_field', {
        table_name: 'community_comments',
        field_name: decField,
        row_id: id,
      });
      await admin.rpc('increment_field', {
        table_name: 'community_comments',
        field_name: incField,
        row_id: id,
      });
    }
  } else {
    await admin.from('community_votes').insert({
      user_id: user.id,
      target_type: 'comment',
      target_id: id,
      vote_type: body.vote_type,
    });
    const incField = body.vote_type === 'up' ? 'likes' : 'dislikes';
    await admin.rpc('increment_field', {
      table_name: 'community_comments',
      field_name: incField,
      row_id: id,
    });
  }

  const { data: comment } = await admin
    .from('community_comments')
    .select('likes, dislikes')
    .eq('id', id)
    .single();

  return NextResponse.json({
    likes: comment?.likes ?? 0,
    dislikes: comment?.dislikes ?? 0,
  });
}
