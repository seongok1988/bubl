import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceRole) {
  console.warn('Missing SUPABASE env for review route')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

async function findReportByReviewId(reviewId: string) {
  // ilike(jsonb) is not supported; fetch candidates and search in JS
  const { data, error } = await supabaseAdmin.from('landlord_reports').select('*').limit(1000)
  if (error) throw error
  if (!data) return null
  for (const row of data) {
    const reviews = Array.isArray(row.reviews) ? row.reviews : []
    if (reviews.find((r: any) => String(r?.id) === String(reviewId))) return row
  }
  return null
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, content } = body
    if (!id || typeof content !== 'string') return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const report = await findReportByReviewId(id)
    if (!report) return NextResponse.json({ error: 'review not found' }, { status: 404 })

    const reviews = Array.isArray(report.reviews) ? report.reviews : []
    const idx = reviews.findIndex((r: any) => r?.id === id)
    if (idx === -1) return NextResponse.json({ error: 'review not found' }, { status: 404 })

    const review = reviews[idx]
    const ownerId = review.user_id ?? review.author_id ?? null
    if (!ownerId || String(ownerId) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const nextReviews = [...reviews]
    nextReviews[idx] = { ...review, content, updated_at: new Date().toISOString() }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('landlord_reports')
      .update({ reviews: nextReviews, updated_at: new Date().toISOString() })
      .eq('id', report.id)
      .select()
      .single()

    if (updateErr) throw updateErr
    return NextResponse.json({ ok: true, reviews: updated.reviews })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    const user = userData.user

    const report = await findReportByReviewId(id)
    if (!report) return NextResponse.json({ error: 'review not found' }, { status: 404 })

    const reviews = Array.isArray(report.reviews) ? report.reviews : []
    const idx = reviews.findIndex((r: any) => r?.id === id)
    if (idx === -1) return NextResponse.json({ error: 'review not found' }, { status: 404 })

    const review = reviews[idx]
    const ownerId = review.user_id ?? review.author_id ?? null
    if (!ownerId || String(ownerId) !== String(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const nextReviews = [...reviews.slice(0, idx), ...reviews.slice(idx + 1)]

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('landlord_reports')
      .update({ reviews: nextReviews, updated_at: new Date().toISOString(), total_reviews: nextReviews.length })
      .eq('id', report.id)
      .select()
      .single()

    if (updateErr) throw updateErr
    return NextResponse.json({ ok: true, reviews: updated.reviews })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}