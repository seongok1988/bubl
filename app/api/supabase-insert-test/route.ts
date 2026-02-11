import { NextResponse } from 'next/server'

// Debug endpoint disabled — remove or set ENABLE_DEBUG_ENDPOINTS=true to re-enable
export async function POST() {
  return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
} 