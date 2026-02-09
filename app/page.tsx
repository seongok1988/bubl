"use client";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { FaSearch, FaComments, FaPhone, FaBuilding, FaShieldAlt } from "react-icons/fa";
import SearchSection from "@/components/SearchSection";
import CommunitySection from "@/components/CommunitySection";
import ConsultSection from "@/components/ConsultSection";
import LoginModal from "@/components/LoginModal";
import AuthSection from "@/components/AuthSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'community' | 'consult'>('search');
  const [showReputationForm, setShowReputationForm] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activeTab === 'community') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    if (activeTab === 'consult') {
      contentRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
  }, [activeTab]);

  const handleLogoClick = () => {
    setActiveTab('search');
    setShowReputationForm(false);
    setSearchResetKey(prev => prev + 1);
    setTimeout(() => {
      if (tabsRef.current) {
        const top = tabsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
      }
    }, 10);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-navy-50">
      <Header onLogoClick={handleLogoClick} />
      <div className="container mx-auto px-4 py-5 flex justify-end">
        <button
          onClick={() => setIsLoginOpen(true)}
          className="px-6 py-2 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 whitespace-nowrap"
        >
          로그인
        </button>
      </div>

      {/* 히어로 섹션 */}
      {activeTab !== 'community' && (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <span className="badge badge-gold text-sm">부동산 평판 인사이트 플랫폼</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-navy-900 mb-6">
              <span className="block">부동산 평판을</span>
              <span className="block text-gradient mt-3 md:mt-4">블러내다!</span>
            </h2>
            
            <p className="text-xl text-navy-600 mb-12 leading-relaxed">
              리포트, 커뮤니티, 상담까지 한 곳에서
              <br />
              <span className="font-semibold text-accent-dark">부블</span>이 빠르고 안전한 결정을 돕습니다
            </p>

            {/* 주요 특징 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card group hover:border-accent/30">
                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <FaSearch className="text-3xl text-accent-dark" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">평판 리포트</h3>
                <p className="text-navy-600 leading-relaxed">
                  임차인 경험 기반 분석으로 리스크와 장점을 한 번에 확인하세요
                </p>
              </div>

              <div className="card group hover:border-accent/30">
                <div className="w-14 h-14 bg-gradient-to-br from-navy-100 to-navy-50 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <FaComments className="text-3xl text-navy-700" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">실시간 커뮤니티</h3>
                <p className="text-navy-600 leading-relaxed">
                  실제 이용 후기를 익명으로 공유하고 빠르게 확인하세요
                </p>
              </div>

              <div className="card group hover:border-accent/30">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <FaShieldAlt className="text-3xl text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">신뢰 검증</h3>
                <p className="text-navy-600 leading-relaxed">
                  검증된 평점과 리뷰로 더 정확한 정보를 제공합니다
                </p>
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white/60 backdrop-blur rounded-xl border border-gray-100">
                <div className="text-3xl font-bold text-accent-dark mb-1">1,240+</div>
                <div className="text-sm text-navy-600">누적 리포트</div>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur rounded-xl border border-gray-100">
                <div className="text-3xl font-bold text-accent-dark mb-1">3,680+</div>
                <div className="text-sm text-navy-600">누적 게시글</div>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur rounded-xl border border-gray-100">
                <div className="text-3xl font-bold text-accent-dark mb-1">850+</div>
                <div className="text-sm text-navy-600">상담 완료</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 탭 네비게이션 */}
      <section
        ref={tabsRef}
        className={`container mx-auto px-4 ${activeTab === 'community' ? 'mt-8 mb-12' : 'mb-10'}`}
      >
        <div className="flex justify-center space-x-3" data-tabnav>
          <button
            onClick={() => {
              setActiveTab('search')
              setShowReputationForm(false)
            }}
            className={`btn ${
              activeTab === 'search' 
                ? 'btn-primary' 
                : 'bg-white text-navy-700 border-2 border-gray-200 hover:border-accent'
            }`}
          >
            <FaSearch className="inline mr-2" />
            평판 조회
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`btn ${
              activeTab === 'community' 
                ? 'btn-primary' 
                : 'bg-white text-navy-700 border-2 border-gray-200 hover:border-accent'
            }`}
          >
            <FaComments className="inline mr-2" />
            커뮤니티
          </button>
          <button
            onClick={() => setActiveTab('consult')}
            className={`btn ${
              activeTab === 'consult' 
                ? 'btn-primary' 
                : 'bg-white text-navy-700 border-2 border-gray-200 hover:border-accent'
            }`}
          >
            <FaPhone className="inline mr-2" />
            상담 신청
          </button>
        </div>
      </section>

      {/* 콘텐츠 섹션 */}
      <section ref={contentRef} className="container mx-auto px-4 pb-16">
        {activeTab === 'search' && (
          <SearchSection
            key={searchResetKey}
            showReputationForm={showReputationForm}
            setShowReputationForm={setShowReputationForm}
          />
        )}
        {activeTab === 'community' && <CommunitySection />}
        {activeTab === 'consult' && <ConsultSection />}
      </section>

      {/* 푸터 */}
      <footer className="bg-navy-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <FaBuilding className="text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  부블
                </h3>
              </div>
              <p className="text-navy-300 text-sm leading-relaxed">
                임차인의 권리를 보호하고
                <br />
                투명한 부동산 임대 시장을 만듭니다
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-accent-light">서비스</h4>
              <ul className="space-y-2 text-sm text-navy-300">
                <li>주소 검색 & 리포트</li>
                <li>임차인 커뮤니티</li>
                <li>전문가 상담</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-accent-light">고객지원</h4>
              <ul className="space-y-2 text-sm text-navy-300">
                <li>📞 1588-0000</li>
                <li>📧 contact@sangablah.com</li>
                <li>🕐 평일 09:00 - 18:00</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-navy-700 pt-6 text-center">
            <p className="text-sm text-navy-400">
              © 2024 부블. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </main>
  )
}
