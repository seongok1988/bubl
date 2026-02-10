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
    } catch (e: any) {
      setError(e.message);
    }
  };

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
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
