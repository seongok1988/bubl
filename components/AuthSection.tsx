"use client";
import React from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export default function AuthSection() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "kakao" });
  };

  const handleEmailSignup = async () => {
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
          />
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setError("회원가입 완료! 이메일을 확인하세요.");
  };

  const handleEmailLogin = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ marginBottom: 24, maxWidth: 320, padding: 16, border: '1px solid #eee', borderRadius: 8, background: '#fafafa' }}>
      {user ? (
        <>
          <div style={{ marginBottom: 16 }}>로그인됨: <b>{user.email}</b></div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#ddd', fontWeight: 'bold' }}>로그아웃</button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <button onClick={handleEmailLogin} style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#4f8cff', color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>로그인</button>
          <button onClick={handleEmailSignup} style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#34c759', color: '#fff', fontWeight: 'bold', marginBottom: 16 }}>회원가입</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#fff', color: '#222', border: '1px solid #ddd', fontWeight: 'bold', marginBottom: 4 }}>구글로 로그인</button>
            <button onClick={handleKakaoLogin} style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#fee500', color: '#3c1e1e', border: '1px solid #e0c200', fontWeight: 'bold' }}>카카오톡으로 로그인</button>
          </div>
          {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
