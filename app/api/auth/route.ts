import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 회원가입 (POST)
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
