import { NextResponse } from 'next/server'

// Admin list debug endpoint disabled — returns 404
export async function GET() {
  return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
} 