"use client";
import { useState } from "react";
import { createSurvey, addSurveyQuestion, submitSurveyAnswer } from "../lib/api/survey";
import { supabase } from "../lib/supabase";

interface Props {
  communityId: string;
  userId: string;
}

export default function SurveyForm({ communityId, userId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [myAnswers, setMyAnswers] = useState<any[]>([])
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)
  const [editingAnswerText, setEditingAnswerText] = useState('')

  const handleCreateSurvey = async () => {
    try {
      const survey = await createSurvey({ community_id: communityId, title, description });
      setSurveyId(survey.id);
      for (const q of questions) {
        await addSurveyQuestion({ survey_id: survey.id, question: q });
      }
      setTitle("");
      setDescription("");
      setQuestions([""]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const loadMyAnswers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? userId
      if (!surveyId || !uid) return
      const list = await fetchSurveyAnswers(surveyId, uid)
      setMyAnswers(list || [])
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => { loadMyAnswers() }, [surveyId])

  const handleAnswer = async () => {
    try {
      // 실제로는 survey_questions에서 question_id를 받아야 함(여기선 예시)
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? userId
      if (!uid) throw new Error('Not authenticated')
      for (let i = 0; i < questions.length; i++) {
        await submitSurveyAnswer({ survey_id: surveyId!, question_id: "question_id_placeholder", user_id: uid, answer: answers[i] });
      }
      setAnswers([]);
      await loadMyAnswers()
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startEditAnswer = (ans: any) => {
    setEditingAnswerId(ans.id)
    setEditingAnswerText(ans.answer)
  }

  const saveEditAnswer = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('로그인되어 있지 않습니다.')
      const res = await updateSurveyAnswer({ id, answer: editingAnswerText })
      if (res?.error) throw new Error(res.error)
      setEditingAnswerId(null)
      setEditingAnswerText('')
      await loadMyAnswers()
    } catch (e: any) { setError(e.message) }
  }

  const removeAnswer = async (id: string) => {
    if (!confirm('응답을 삭제하시겠습니까?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('로그인되어 있지 않습니다.')
      const res = await deleteSurveyAnswer({ id })
      if (res?.error) throw new Error(res.error)
      await loadMyAnswers()
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div>
      <h3>설문지 생성</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="설문 제목" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="설명" />
      {questions.map((q, idx) => (
        <input key={idx} value={q} onChange={e => {
          const arr = [...questions];
          arr[idx] = e.target.value;
          setQuestions(arr);
        }} placeholder={`문항 ${idx + 1}`} />
      ))}
      <button onClick={() => setQuestions([...questions, ""])}>문항 추가</button>
      <button onClick={handleCreateSurvey}>설문 생성</button>
      <hr />
      <h3>설문 응답 (예시)</h3>
      {questions.map((q, idx) => (
        <div key={idx}>
          <span>{q}</span>
          <input value={answers[idx] || ""} onChange={e => {
            const arr = [...answers];
            arr[idx] = e.target.value;
            setAnswers(arr);
          }} placeholder="응답" />
        </div>
      ))}
      <button onClick={handleAnswer}>응답 제출</button>

      <h4 className="mt-4">내 응답</h4>
      {myAnswers.length === 0 ? (
        <div>응답이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {myAnswers.map((a) => (
            <div key={a.id} className="p-2 border rounded">
              {editingAnswerId === a.id ? (
                <div>
                  <input value={editingAnswerText} onChange={e => setEditingAnswerText(e.target.value)} />
                  <button onClick={() => saveEditAnswer(a.id)}>저장</button>
                  <button onClick={() => { setEditingAnswerId(null); setEditingAnswerText('') }}>취소</button>
                </div>
              ) : (
                <div>
                  <div>{a.answer}</div>
                  <div className="mt-1 text-xs text-navy-500">{new Date(a.created_at).toLocaleString()}</div>
                  <div className="mt-2">
                    <button onClick={() => startEditAnswer(a)}>수정</button>
                    <button style={{ marginLeft: 8, color: 'red' }} onClick={() => removeAnswer(a.id)}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
