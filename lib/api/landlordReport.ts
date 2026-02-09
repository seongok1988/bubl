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
