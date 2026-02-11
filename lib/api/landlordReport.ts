// 주소로 landlord_reports에서 리포트 1건을 가져오는 함수
export async function fetchLandlordReportByAddress(address: string) {
  const trimmed = address.trim()
  // 먼저 정확히 일치하는 레코드를 찾음
  let { data: exact, error: exactErr } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('address', trimmed)
    .maybeSingle()
  if (exactErr) throw exactErr
  if (exact) return exact

  // 못 찾으면 부분 일치로 검색
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .ilike('address', `%${trimmed}%`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
import { supabase } from '../supabase.ts';

export interface LandlordReportInsert {
  address: string;
  evaluation?: any;
  reviews?: any[];
  positiveTraits?: string[];
  negativeTraits?: string[];
}

function avgFromEvaluation(evaluation: any) {
  if (!evaluation || typeof evaluation !== 'object') return null
  const keys = ['negotiationFlexibility','renewalManners','interferenceIndex','maintenanceCooperation']
  const vals: number[] = []
  for (const k of keys) {
    const v = parseFloat(String(evaluation[k] ?? NaN))
    if (!Number.isNaN(v)) vals.push(v)
  }
  if (!vals.length) return null
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length
  return Math.round(avg * 10) / 10
}

function avgFromReviews(reviews: any[]) {
  if (!Array.isArray(reviews) || !reviews.length) return null
  const vals = reviews.map(r => Number(r?.rating)).filter(v => !Number.isNaN(v))
  if (!vals.length) return null
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length
  return Math.round(avg * 10) / 10
}

export async function createLandlordReport(report: LandlordReportInsert) {
  if (!report.address) throw new Error('address is required')

  // Try exact match first
  const { data: existing, error: findError } = await supabase
    .from('landlord_reports')
    .select('*')
    .eq('address', report.address)
    .maybeSingle()

  if (findError) throw findError

  // compute numeric rating from evaluation object or reviews
  const computedRating = avgFromEvaluation(report.evaluation) ?? avgFromReviews(report.reviews) ?? 0

  if (existing && existing.id) {
    // Merge reviews arrays (new reviews should be prepended)
    const existingReviews = Array.isArray(existing.reviews) ? existing.reviews : []
    const newReviews = Array.isArray(report.reviews) ? report.reviews : []
    const mergedReviews = [...newReviews, ...existingReviews]

    const updatedRating = avgFromEvaluation(report.evaluation) ?? avgFromReviews(mergedReviews) ?? existing.rating ?? 0

    const updated = {
      landlord_name: existing.landlord_name || null,
      rating: updatedRating,
      total_reviews: mergedReviews.length,
      positive_traits: report.positiveTraits?.length ? report.positiveTraits : existing.positive_traits,
      negative_traits: report.negativeTraits?.length ? report.negativeTraits : existing.negative_traits,
      evaluation: report.evaluation ?? existing.evaluation,
      reviews: mergedReviews,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('landlord_reports')
      .update(updated)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Insert new report
  const id = report.id ?? (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `id-${Date.now()}`)
  const toInsert = {
    id,
    address: report.address,
    landlord_name: undefined,
    rating: computedRating,
    total_reviews: Array.isArray(report.reviews) ? report.reviews.length : 0,
    positive_traits: report.positiveTraits || [],
    negative_traits: report.negativeTraits || [],
    recommendations: 0,
    warnings: 0,
    evaluation: report.evaluation ?? null,
    user_notes: null,
    reviews: report.reviews || [],
    evaluation_scores: [],
    keyword_selections: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('landlord_reports')
    .insert([toInsert])
    .select()
    .single()

  if (error) throw error
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
