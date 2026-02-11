import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!supabaseServiceRole) console.warn('SUPABASE_SERVICE_ROLE_KEY is not set; survey-answer edit/delete may fail')
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

// 설문 응답 수정 (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { id, answer } = await req.json()
    if (!id || typeof answer !== 'string') return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const { data: resp, error: findErr } = await supabaseAdmin.from('survey_answers').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!resp) return NextResponse.json({ error: 'answer not found' }, { status: 404 })
    if (String(resp.user_id) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { data: updated, error: updateErr } = await supabaseAdmin.from('survey_answers').update({ answer }).eq('id', id).select().single()
    if (updateErr) return NextResponse.json({ error: String(updateErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

// 설문 응답 삭제 (DELETE)
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

    const { data: resp, error: findErr } = await supabaseAdmin.from('survey_answers').select('*').eq('id', id).single()
    if (findErr) return NextResponse.json({ error: String(findErr) }, { status: 500 })
    if (!resp) return NextResponse.json({ error: 'answer not found' }, { status: 404 })
    if (String(resp.user_id) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { data: deleted, error: delErr } = await supabaseAdmin.from('survey_answers').delete().eq('id', id).select().single()
    if (delErr) return NextResponse.json({ error: String(delErr) }, { status: 500 })
    return NextResponse.json({ success: true, data: deleted })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}