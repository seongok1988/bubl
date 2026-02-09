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
  positiveTraits?: string[];
  negativeTraits?: string[];
}

export async function createLandlordReport(report: LandlordReportInsert) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .insert([report])
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
