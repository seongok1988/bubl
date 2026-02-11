import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 댓글 등록 (POST)
export async function POST(req: NextRequest) {
  try {
    const { post_id, text, author } = await req.json()
    const { data, error } = await supabase.from('comments').insert([
      { post_id, text, author }
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// 댓글 목록 (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const post_id = searchParams.get('post_id')
    const { data, error } = await supabase.from('comments').select('*').eq('post_id', post_id).order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
