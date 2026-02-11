import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!supabaseServiceRole) console.warn('SUPABASE_SERVICE_ROLE_KEY is not set; comment edit/delete may fail')
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

// 댓글 등록 (POST)
export async function POST(req: NextRequest) {
  try {
    const { post_id, text, author, author_id } = await req.json()
    const { data, error } = await supabase.from('comments').insert([
      { post_id, content: text ?? '', author, author_id }
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

// 댓글 수정 (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { id, content } = await req.json()
    if (!id || typeof content !== 'string') return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const { data: comment, error: findErr } = await supabaseAdmin.from('comments').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!comment) return NextResponse.json({ error: 'comment not found' }, { status: 404 })
    const ownerId = (comment as any).author_id ?? (comment as any).user_id ?? (comment as any).userId ?? null
    if (!ownerId || String(ownerId) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { data: updated, error: updateErr } = await supabaseAdmin.from('comments').update({ content }).eq('id', id).select().single()
    if (updateErr) return NextResponse.json({ error: String(updateErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

// 댓글 삭제 (DELETE)
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

    const { data: comment, error: findErr } = await supabaseAdmin.from('comments').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!comment) return NextResponse.json({ error: 'comment not found' }, { status: 404 })
    const ownerId = (comment as any).author_id ?? (comment as any).user_id ?? (comment as any).userId ?? null
    if (!ownerId || String(ownerId) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { data: deleted, error: delErr } = await supabaseAdmin.from('comments').delete().eq('id', id).select().single()
    if (delErr) return NextResponse.json({ error: String(delErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: deleted })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
