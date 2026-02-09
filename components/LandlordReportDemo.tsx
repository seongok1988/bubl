"use client";

import { useState } from "react";
import { createLandlordReport, fetchLandlordReportById } from "../lib/api/landlordReport";
import LandlordReportComponent from "./LandlordReportComponent";
import Header from "./Header";
import SearchSection from "./SearchSection";

export default function LandlordReportDemo() {
  // SearchSection의 상태를 이 컴포넌트에서 관리하여 상단 바(부블) 클릭 시 평판 조회 UI로 이동하도록 통일
  const [showReputationForm, setShowReputationForm] = useState(false);
  const [searchResetKey, setSearchResetKey] = useState(0);

  const handleLogoClick = () => {
    setShowReputationForm(false);
    setSearchResetKey((prev) => prev + 1);
    setTimeout(() => {
      const tabs = document.querySelector('[data-tabnav]');
      if (tabs) {
        const top = (tabs as HTMLElement).getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
      }
    }, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-navy-50">
      <Header onLogoClick={handleLogoClick} />
      <div className="container mx-auto px-4 py-8">
        <SearchSection key={searchResetKey} showReputationForm={showReputationForm} setShowReputationForm={setShowReputationForm} />
      </div>
    </div>
  );
}
