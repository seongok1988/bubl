import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const category = url.searchParams.get('category');
  const sort = url.searchParams.get('sort') || 'recent';
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const admin = supabaseAdmin;
  let query = admin
    .from('community_posts')
    .select('*, user_profiles(*)')
    .eq('status', 'active');

  if (category) query = query.eq('category', category);
  if (sort === 'popular') {
    query = query.order('likes', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 댓글 수 추가
  const postIds = (data || []).map((p: { id: string }) => p.id);
  if (postIds.length > 0) {
    const { data: counts } = await admin
      .from('community_comments')
      .select('post_id')
      .in('post_id', postIds)
      .eq('status', 'active');
    const countMap: Record<string, number> = {};
    (counts || []).forEach((c: { post_id: string }) => {
      countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
    });
    (data || []).forEach((p: { id: string; comment_count?: number }) => {
      p.comment_count = countMap[p.id] || 0;
    });
  }

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
    .from('community_posts')
    .insert({
      user_id: user.id,
      title: body.title,
      content: body.content,
      category: body.category,
      status: 'active',
      likes: 0,
      dislikes: 0,
    })
    .select('*, user_profiles(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
