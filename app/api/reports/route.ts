import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/services/supabase-auth';
import { supabaseAdmin } from '@/services/supabase-server';

export async function GET(req: NextRequest) {
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const mine = req.nextUrl.searchParams.get('mine');

  if (mine === 'true') {
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabase
      .from('review_reports')
      .select('*, user_profiles(*)')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // admin 용도: 모든 신고 조회
  const admin = supabaseAdmin;
  const { data, error } = await admin
    .from('review_reports')
    .select('*, user_profiles(*), reputation_surveys(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createAuthClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const admin = supabaseAdmin;

  // 1. 신고 생성
  const { data: report, error: reportErr } = await admin
    .from('review_reports')
    .insert({
      reporter_id: user.id,
      target_survey_id: body.target_survey_id || null,
      target_review_id: body.target_review_id || null,
      reason: body.reason,
      detail: body.detail || null,
      attachment_url: body.attachment_url || null,
      status: 'pending',
    })
    .select()
    .single();

  if (reportErr) return NextResponse.json({ error: reportErr.message }, { status: 500 });

  // 2. 즉시 블라인드 처리 (리뷰/설문)
  if (body.target_survey_id) {
    await admin
      .from('reputation_surveys')
      .update({ status: 'blind' })
      .eq('id', body.target_survey_id);
  }

  // 3. 신고자에게 알림
  await admin.from('notifications').insert({
    user_id: user.id,
    type: 'report',
    title: '신고 접수 완료',
    message:
      '주소와 함께 신고가 접수되었습니다. 확인을 위해 30일간 해당 리뷰는 우선 블라인드 처리되며, 비방/허설 없이 확인되면 영구 처리됩니다. 단 확인된 내용이 아닐 경우 해당 게시물은 다시 보입니다.',
  });

  // 4. 피신고자에게 알림 (설문 작성자)
  if (body.target_survey_id) {
    const { data: survey } = await admin
      .from('reputation_surveys')
      .select('user_id')
      .eq('id', body.target_survey_id)
      .single();

    if (survey) {
      await admin.from('notifications').insert({
        user_id: survey.user_id,
        type: 'report',
        title: '리뷰 블라인드 처리 안내',
        message:
          '귀하의 리뷰가 신고 접수로 인해 30일간 블라인드 처리되었습니다. 이의 신청은 7일 이내에 제출해 주세요. 이의 신청은 이메일(bublcenter@gmail.com)을 통해 접수 부탁드립니다.',
      });
    }
  }

  return NextResponse.json(report, { status: 201 });
}
