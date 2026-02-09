"use client";
import { FaBuilding } from "react-icons/fa";

export default function Header({ onLogoClick, onLoginClick }: { onLogoClick?: () => void, onLoginClick?: () => void }) {
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
          <button
            onClick={onLoginClick}
            className="ml-auto px-6 py-2 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 whitespace-nowrap"
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
