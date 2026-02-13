import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const admin = supabaseAdmin;

  const { data, error } = await admin
    .from('legal_logs')
    .insert({
      user_id: user.id,
      survey_id: body.survey_id || null,
      agreed: true,
      disclaimer_text: body.disclaimer_text,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
