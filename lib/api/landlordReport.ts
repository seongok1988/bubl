// 주소로 landlord_reports에서 리포트 1건을 가져오는 함수
export async function fetchLandlordReportByAddress(address: string) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('address', address)
    .maybeSingle();
  if (error) throw error;
  return data;
}
import { supabase } from '../supabase';

export interface LandlordReportInsert {
  address: string;
  evaluation?: any;
  reviews?: any[];
  positive_traits?: string[];
  negative_traits?: string[];
}

export async function createLandlordReport(report: LandlordReportInsert) {
  // 컬럼명 변환: positiveTraits → positive_traits, negativeTraits → negative_traits
  const { positiveTraits, negativeTraits, ...rest } = report as any;
  // landlord_reports의 id는 text PK이므로 직접 uuid를 생성해 전달해야 함
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // Supabase Auth에서 현재 로그인 사용자 id 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { landlord_id, ...restWithoutLandlordId } = rest;
  const insertObj = {
    id: uuidv4(),
    author_id: user.id,
    ...restWithoutLandlordId,
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
  if (error) throw error;
  return data;
}

export async function fetchLandlordReportById(id: string) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
