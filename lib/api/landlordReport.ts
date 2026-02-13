import { supabase } from '@/services/supabase';
import type { LandlordReportInsert } from '@/types/db';

// ---- UUID 생성 유틸 ----
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---- 주소로 리포트 1건 조회 ----
export async function fetchLandlordReportByAddress(address: string) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('address', address)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---- 리포트 생성 ----
export async function createLandlordReport(report: LandlordReportInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  // positiveTraits/negativeTraits → positive_traits/negative_traits 변환
  const { positiveTraits, negativeTraits, landlord_id, ...rest } = report as any;
  const insertObj: Record<string, unknown> = {
    id: uuidv4(),
    author_id: user.id,
    ...rest,
    ...(positiveTraits ? { positive_traits: positiveTraits } : {}),
    ...(negativeTraits ? { negative_traits: negativeTraits } : {}),
    ...((report as any).positive_traits ? { positive_traits: (report as any).positive_traits } : {}),
    ...((report as any).negative_traits ? { negative_traits: (report as any).negative_traits } : {}),
  };

  const { data, error } = await supabase
    .from('landlord_reports')
    .insert([insertObj])
    .select()
    .single();
  if (error) {
    console.error('[landlordReport] Insert error:', error);
    throw error;
  }
  return data;
}

// ---- ID로 리포트 조회 ----
export async function fetchLandlordReportById(id: string) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
