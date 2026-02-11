import { NextResponse } from 'next/server'
import { Client } from 'pg'

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS landlord_reports (
  id text primary key,
  address text not null,
  landlord_name text,
  rating numeric,
  total_reviews integer,
  positive_traits text[] default '{}',
  negative_traits text[] default '{}',
  recommendations integer default 0,
  warnings integer default 0,
  evaluation jsonb,
  user_notes text,
  reviews jsonb,
  evaluation_scores jsonb default '[]'::jsonb,
  keyword_selections jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_landlord_reports_address ON landlord_reports(address);
`

export async function POST(req: Request) {
  // Protect this endpoint: require service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않아 실행할 수 없습니다.' }, { status: 403 })
  }

  // require service DB connection string
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ ok: false, error: '서버에 데이터베이스 접속 문자열이 설정되어 있지 않습니다. 환경변수 DATABASE_URL 또는 SUPABASE_DB_URL을 설정하세요.' }, { status: 400 })
  }

  try {
    const client = new Client({ connectionString: dbUrl })
    await client.connect()
    await client.query(CREATE_SQL)
    await client.end()
    return NextResponse.json({ ok: true, message: 'landlord_reports 테이블이 생성되었거나 이미 존재합니다.' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 })
  }
}
