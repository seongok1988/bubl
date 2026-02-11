import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!supabaseServiceRole) console.warn('SUPABASE_SERVICE_ROLE_KEY is not set; post edit/delete may fail')
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

// 게시글 등록 (POST)
export async function POST(req: NextRequest) {
  try {
    const { community_id, title, content } = await req.json()
    // 인증 토큰 확인 (생략 가능)

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

// 게시글 수정 (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { id, title, content } = await req.json()
    if (!id) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const { data: post, error: findErr } = await supabaseAdmin.from('posts').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 })
    if (!post.author_id || String(post.author_id) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const updates: any = {}
    if (typeof title === 'string') updates.title = title
    if (typeof content === 'string') updates.content = content

    const { data: updated, error: updateErr } = await supabaseAdmin.from('posts').update(updates).eq('id', id).select().single()
    if (updateErr) return NextResponse.json({ error: String(updateErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

// 게시글 삭제 (DELETE)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const { data: post, error: findErr } = await supabaseAdmin.from('posts').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 })
    if (!post.author_id || String(post.author_id) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { data: deleted, error: delErr } = await supabaseAdmin.from('posts').delete().eq('id', id).select().single()
    if (delErr) return NextResponse.json({ error: String(delErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: deleted })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
