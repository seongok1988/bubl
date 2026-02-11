import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('landlord_reports').select('id').limit(1)
    if (error) {
      const msg = (error && (error as any).message) || String(error)
      const isMissing = msg.includes('Could not find the table') || msg.includes('schema cache')
      const sql = `-- SQL to create landlord_reports\ncreate table if not exists landlord_reports (\n  id text primary key,\n  address text not null,\n  landlord_name text,\n  rating numeric,\n  total_reviews integer,\n  positive_traits text[] default '{}',\n  negative_traits text[] default '{}',\n  recommendations integer default 0,\n  warnings integer default 0,\n  evaluation jsonb,\n  user_notes text,\n  reviews jsonb,\n  evaluation_scores jsonb default '[]'::jsonb,\n  keyword_selections jsonb default '[]'::jsonb,\n  created_at timestamptz default now(),\n  updated_at timestamptz default now()\n);`
      return NextResponse.json({ ok: false, exists: false, missing: isMissing, error: msg, sql }, { status: 200 })
    }

    return NextResponse.json({ ok: true, exists: Array.isArray(data) ? data.length > 0 : true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 })
  }
}
