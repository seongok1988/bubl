"use client";


import { FaBuilding, FaSignOutAlt } from "react-icons/fa";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { supabase } from "@/lib/supabase";

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
              className="font-semibold text-navy-900 tracking-widest"
              style={{ fontSize: '2.75rem', fontFamily: 'Quicksand, Unbounded, Poppins, sans-serif', letterSpacing: '0.08em', fontWeight: 600 }}
            >
              bubl
            </h1>
          </button>
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="ml-auto flex items-center gap-2 px-6 py-2 bg-navy-100 text-navy-900 font-semibold rounded-full shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:bg-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-light whitespace-nowrap"
                title="로그아웃"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="tracking-wide">로그아웃</span>
              </button>
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
