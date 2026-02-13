import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const admin = supabaseAdmin;
  const { data, error } = await admin
    .from('community_comments')
    .select('*, user_profiles(*)')
    .eq('post_id', postId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const admin = supabaseAdmin;

  const { data, error } = await admin
    .from('community_comments')
    .insert({
      post_id: body.post_id,
      user_id: user.id,
      parent_id: body.parent_id || null,
      content: body.content,
      is_secret: body.is_secret || false,
      status: 'active',
      likes: 0,
      dislikes: 0,
    })
    .select('*, user_profiles(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
