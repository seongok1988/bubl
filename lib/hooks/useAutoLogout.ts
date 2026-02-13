'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/services/supabase';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분

/**
 * 비활성 30분 후 자동 로그아웃
 */
export function useAutoLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        alert('장시간 미사용으로 자동 로그아웃되었습니다.');
        window.location.href = '/';
      }
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    // 세션 만료 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        resetTimer();
      }
      if (event === 'SIGNED_OUT') {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    });

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.unsubscribe();
    };
  }, [resetTimer]);
}
