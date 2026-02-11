import { NextResponse } from 'next/server'

// Disabled policy-check debug endpoint — returns 404
export async function GET() {
  return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
} 