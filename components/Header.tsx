"use client";

import { FaBuilding } from "react-icons/fa";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { supabase } from "@/services/supabase";

export default function Header({ onLogoClick, onLoginClick }: { onLogoClick?: () => void, onLoginClick?: () => void }) {
  const { user, loading } = useAuthUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 새로고침으로 상태 반영 (필요시)
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-full mx-auto px-6 py-5">
        <div className="flex items-center justify-between px-24">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition cursor-pointer bg-transparent border-none p-0"
          >
            <h1
              className="text-4xl font-extrabold text-navy-900 tracking-widest"
              style={{ fontFamily: 'Unbounded, sans-serif', letterSpacing: '0.08em' }}
            >
              Bubl
            </h1>
          </button>
          {!loading && (
            user ? (
              <div className="ml-auto flex items-center gap-3">
                <a
                  href="/mypage"
                  className="px-4 py-2 text-sm font-semibold text-navy-700 hover:text-accent transition whitespace-nowrap"
                >
                  마이페이지
                </a>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 whitespace-nowrap"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="ml-auto px-6 py-2 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 whitespace-nowrap"
              >
                로그인
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
