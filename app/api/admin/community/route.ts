import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase-server';

export async function GET() {
  const admin = supabaseAdmin;
  const { data, error } = await admin
    .from('community_posts')
    .select('*, user_profiles(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
