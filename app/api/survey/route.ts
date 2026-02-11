import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 임대인 평판 설문 등록 (POST)
export async function POST(req: NextRequest) {
  try {
    const { answers, author } = await req.json()
    const { data, error } = await supabase.from('surveys').insert([
      { answers, author }
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// 설문 목록 (GET)
export async function GET() {
  try {
    const { data, error } = await supabase.from('surveys').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
