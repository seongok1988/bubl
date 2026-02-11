import { NextResponse } from 'next/server'

// Disabled admin debug endpoint — returns 404
export async function POST() {
  return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
} 