import { supabase } from '../supabase';

// 설문 목록 조회
export async function fetchSurveys(communityId: string) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// 설문 생성
export async function createSurvey({ community_id, title, description }: { community_id: string; title: string; description?: string }) {
  const { data, error } = await supabase
    .from('surveys')
    .insert([{ community_id, title, description }])
    .select();
  if (error) throw error;
  return data?.[0];
}

// 설문 문항 추가
export async function addSurveyQuestion({ survey_id, question }: { survey_id: string; question: string }) {
  const { data, error } = await supabase
    .from('survey_questions')
    .insert([{ survey_id, question }])
    .select();
  if (error) throw error;
  return data?.[0];
}

// 설문 응답 제출
export async function submitSurveyAnswer({ survey_id, question_id, user_id, answer }: { survey_id: string; question_id: string; user_id: string; answer: string }) {
  const { data, error } = await supabase
    .from('survey_answers')
    .insert([{ survey_id, question_id, user_id, answer }])
    .select();
  if (error) throw error;
  return data?.[0];
}

// 설문 응답 수정 (서버 API 사용)

export async function updateSurveyAnswer({ id, answer }: { id: string; answer: string }) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const resp = await fetch('/api/survey-answer', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ id, answer }) })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function deleteSurveyAnswer({ id }: { id: string }) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const resp = await fetch('/api/survey-answer', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ id }) })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function fetchSurveyAnswers(survey_id: string, user_id?: string) {
  const { data, error } = await supabase.from('survey_answers').select('*').eq('survey_id', survey_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  if (user_id) return data.filter((d: any) => String(d.user_id) === String(user_id))
  return data
}
