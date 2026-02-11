import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 게시글 등록 (POST)
export async function POST(req: NextRequest) {
  try {
    const { community_id, title, content } = await req.json()
    // 인증 토큰 확인 (생략 가능)
    // const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    // if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // supabase DB에 게시글 저장 (예시)
    const { data, error } = await supabase.from('posts').insert([
      { community_id, title, content }
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// 게시글 목록 (GET)
export async function GET() {
  try {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
