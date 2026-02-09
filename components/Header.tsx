"use client";
import { FaBuilding } from "react-icons/fa";

export default function Header({ onLogoClick }: { onLogoClick?: () => void }) {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition cursor-pointer bg-transparent border-none p-0"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
              <FaBuilding className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              부블
            </h1>
          </button>
        </div>
      </div>
    </header>
  );
}
