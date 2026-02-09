'use client'

import { useEffect, useRef, useState } from 'react'
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa'
import LandlordReportComponent, { LandlordEvaluation, LandlordReport, ReputationSubmitSummary } from './LandlordReportComponent'
import KakaoAddressSearch from './KakaoAddressSearch'

interface SearchSectionProps {
  showReputationForm: boolean
  setShowReputationForm: (v: boolean) => void
}

export default function SearchSection({ showReputationForm, setShowReputationForm }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [report, setReport] = useState<LandlordReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submittedAddresses, setSubmittedAddresses] = useState<Record<string, boolean>>({})
  const [resultOverrides, setResultOverrides] = useState<Record<string, { averageEvaluation: LandlordEvaluation | null; topKeywords: string[] }>>({})
  const [resetSeed, setResetSeed] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const formContainerRef = useRef<HTMLDivElement | null>(null)
  const reputationHeaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (showReputationForm && reputationHeaderRef.current) {
      const top = reputationHeaderRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: Math.max(0, top - 24), behavior: 'auto' })
    }
  }, [showReputationForm])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('submittedAddresses')
      if (!stored) return
      const parsed = JSON.parse(stored) as Record<string, boolean>
      if (parsed && typeof parsed === 'object') {
        setSubmittedAddresses(parsed)
      }
    } catch (error) {
      console.error('Failed to load submitted addresses:', error)
    }
  }, [])

  const persistSubmittedAddresses = (next: Record<string, boolean>) => {
    try {
      localStorage.setItem('submittedAddresses', JSON.stringify(next))
    } catch (error) {
      console.error('Failed to save submitted addresses:', error)
    }
  }

  const handleResetTestAddress = (address: string) => {
    setSubmittedAddresses((prev) => {
      const next = { ...prev }
      delete next[address]
      persistSubmittedAddresses(next)
      return next
    })
    setResultOverrides((prev) => {
      const next = { ...prev }
      delete next[address]
      return next
    })
    try {
      localStorage.removeItem(`evaluationScores:${address}`)
      localStorage.removeItem(`keywordSelections:${address}`)
      localStorage.removeItem(`reviews:${address}`)
      localStorage.removeItem(`reviewComments:${address}`)
    } catch (error) {
      console.error('Failed to reset local test data:', error)
    }
    setResetSeed((prev) => prev + 1)
  }

  // 샘플 데이터 (실제로는 Supabase에서 가져옴)
  const sampleData: Record<string, LandlordReport> = {
    '서울시 강남구 역삼동 123-45': {
      address: '서울시 강남구 역삼동 123-45',
      landlordName: '김** 님',
      rating: 4.2,
      totalReviews: 15,
      positiveTraits: ['계약서 준수', '수리 빠름', '소통 원활'],
      negativeTraits: ['보증금 반환 지연 경험 있음'],
      recommendations: 12,
      warnings: 3,
      evaluation: {
        negotiationFlexibility: 3.5,
        renewalManners: 4.1,
        interferenceIndex: 2.8,
        maintenanceCooperation: 4.3,
      },
      userNotes: '임차인이 기록한 내용: 임대인과의 계약 체결 시 상당히 협조적이었으며, 시설 관리도 월등하다. 다만 보증금 반환 시 약간의 지연이 있었음.',
      reviews: [],
    },
    '서울시 마포구 서교동 456-78': {
      address: '서울시 마포구 서교동 456-78',
      landlordName: '이** 님',
      rating: 3.5,
      totalReviews: 8,
      positiveTraits: ['시설 관리 양호'],
      negativeTraits: ['임대료 인상 자주', '연락 안됨'],
      recommendations: 4,
      warnings: 4,
      evaluation: {
        negotiationFlexibility: 2.3,
        renewalManners: 2.8,
        interferenceIndex: 3.5,
        maintenanceCooperation: 3.2,
      },
      userNotes: '임차인이 기록한 내용: 연락이 잘 안 되는 편이고, 갱신 시 임대료 인상이 자주 발생합니다. 시설 자체는 잘 관리되고 있습니다.',
      reviews: [
        {
          id: '4',
          nickname: '파란하늘',
          rating: 4,
          content: '건물 시설은 깨끗하고 잘 관리됩니다.',
          date: '2024-12-05',
          helpful: 3,
          unhelpful: 0,
        },
        {
          id: '5',
          nickname: '빨강머리',
          rating: 3,
          content: '임대료 인상이 좀 과하다고 생각됩니다.',
          date: '2024-11-12',
          helpful: 7,
          unhelpful: 1,
        },
        {
          id: '6',
          nickname: '초록나무',
          rating: 3,
          content: '연락이 잘 안 되어 문제가 생길 때 답답합니다.',
          date: '2024-10-25',
          helpful: 4,
          unhelpful: 0,
        },
      ],
    },
    '서울시 종로구 종로 789-12': {
      address: '서울시 종로구 종로 789-12',
      landlordName: '박** 님',
      rating: 0,
      totalReviews: 0,
      positiveTraits: [],
      negativeTraits: [],
      recommendations: 0,
      warnings: 0,
      // evaluation이 없음 - 임대인 평가가 아직 없는 경우
      reviews: [
        {
          id: '7',
          nickname: '파주운',
          rating: 4,
          content: '위치가 정말 좋고 교통이 편리합니다.',
          date: '2024-12-10',
          helpful: 2,
          unhelpful: 0,
        },
        {
          id: '8',
          nickname: '소울',
          rating: 4,
          content: '건물이 새것 같고 시설이 괜찮습니다.',
          date: '2024-11-28',
          helpful: 3,
          unhelpful: 0,
        },
      ],
    },
  }

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      const trimmed = searchQuery.trim();
      // 사용자가 설문을 제출한 주소라면 실제 리포트만 보여줌 (예시 데이터 무시)
      if (trimmed && submittedAddresses[trimmed]) {
        // 실제 리포트(평가/설문) 데이터 fetch 또는 상태로 대체 필요
        // 여기서는 샘플 구조상 빈 리포트로 처리
        setReport({
          address: trimmed,
          landlordName: '',
          rating: 0,
          totalReviews: 0,
          positiveTraits: [],
          negativeTraits: [],
          recommendations: 0,
          warnings: 0,
          evaluation: undefined,
          userNotes: '',
          reviews: [],
        });
      } else {
        // 설문이 없는 주소는 sampleData 예시를 보여줌
        const found = Object.keys(sampleData).find(key => key.includes(trimmed));
        if (found) {
          setReport(sampleData[found]);
        } else if (trimmed) {
          setReport({
            address: trimmed,
            landlordName: '',
            rating: 0,
            totalReviews: 0,
            positiveTraits: [],
            negativeTraits: [],
            recommendations: 0,
            warnings: 0,
            evaluation: undefined,
            userNotes: '',
            reviews: [],
          });
        } else {
          setReport(null);
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const handleOpenReputationForm = () => {
    setReport(null)
    setSearchQuery('')
    setShowReputationForm(true)
  }


  const handleGoHome = () => {
    setReport(null)
    setSearchQuery('')
  }

  const handleReputationSubmitted = (summary: ReputationSubmitSummary) => {
    const nextReport = report || sampleData['서울시 강남구 역삼동 123-45']
    setSubmittedAddresses((prev) => {
      const next = { ...prev, [nextReport.address]: true }
      persistSubmittedAddresses(next)
      return next
    })
    setResultOverrides((prev) => ({
      ...prev,
      [summary.address]: {
        averageEvaluation: summary.averageEvaluation,
        topKeywords: summary.topKeywords,
      },
    }))
    if (!report) {
      setReport(nextReport)
    }
    setShowReputationForm(false)
  }

  if (showReputationForm) {
    const formReport = report || sampleData['서울시 강남구 역삼동 123-45']
    const isAddressLocked = !!submittedAddresses[formReport.address]
    // 주소 선택 시 해당 주소로 검색 및 평판 작성
    const handleAddressSelect = (address: string) => {
      setSearchQuery(address)
      if (sampleData[address]) {
        setReport(sampleData[address])
      } else {
        setReport({
          address,
          landlordName: '',
          rating: 0,
          totalReviews: 0,
          positiveTraits: [],
          negativeTraits: [],
          recommendations: 0,
          warnings: 0,
          evaluation: undefined,
          userNotes: '',
          reviews: [],
        })
      }
    }

    // 뒤로가기 시 탭 네비게이션까지 자동 스크롤
    const handleBackWithScroll = () => {
      setShowReputationForm(false)
      setTimeout(() => {
        const tabs = document.querySelector('[data-tabnav]');
        if (tabs) {
          const top = (tabs as HTMLElement).getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
        }
      }, 10);
    }
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div ref={formContainerRef} className="w-full max-w-2xl space-y-4">
          <div ref={reputationHeaderRef} className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">평판 제보하기</h2>
          </div>
          {/* 카카오 주소 검색 UI 삽입 */}
          <div className="card-premium">
            <h3 className="text-lg font-bold mb-2 flex items-center text-navy-900">
              <div className="w-9 h-9 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mr-3">
                <FaMapMarkerAlt className="text-accent-dark" />
              </div>
              부동산 주소 검색
            </h3>
            <p className="text-sm text-navy-600 mb-4">
              주소를 검색하면 해당 임대인 평판에 대한 설문을 작성할 수 있어요.
            </p>
            <KakaoAddressSearch
              onSelect={handleAddressSelect}
              placeholder="예: 역삼동 123-45"
              buttonLabel="검색"
            />
            {searchQuery && report && (
              <p className="text-xs text-emerald-600 mt-3">
                주소가 확인되었습니다.
              </p>
            )}
            {searchQuery && !report && (
              <p className="text-xs text-navy-500 mt-3">
                검색 결과가 없어요.
                <span className="ml-2">주소를 다시 확인해 주세요.</span>
              </p>
            )}
          </div>
          <LandlordReportComponent
            key={`report-form-${formReport.address}-${resetSeed}`}
            report={formReport}
            showOnlyForm
            onSubmitSuccess={handleReputationSubmitted}
            isAddressLocked={isAddressLocked}
            onBack={handleBackWithScroll}
          />
        </div>
      </div>
    )
  }

  // 홈으로 가기(초기화) 핸들러
  const handleGoHomeAll = () => {
    setSelectedAddress(null)
    setSearchQuery('')
    setReport(null)
    // 탭 네비게이션이 상단에 오도록 스크롤
    setTimeout(() => {
      const tabs = document.querySelector('[data-tabnav]');
      if (tabs) {
        const top = (tabs as HTMLElement).getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
      }
    }, 10);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 검색 입력 */}
      <div className="card-premium mb-8">
        <h3 className="text-2xl font-bold mb-3 flex items-center text-navy-900">
          <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mr-3">
            <FaMapMarkerAlt className="text-accent-dark" />
          </div>
          부동산 평판 조회
        </h3>
        <p className="text-sm text-navy-600 mb-5">
          카카오 주소 검색을 통해 임대인 평판과 리뷰를 확인하세요.
        </p>
        {!selectedAddress ? (
          <>
            <KakaoAddressSearch
              onSelect={(address) => {
                setSearchQuery(address);
                setSelectedAddress(address);
                if (sampleData[address]) {
                  setReport(sampleData[address]);
                } else {
                  // sampleData 중 첫 번째 예시를 보여줌
                  const firstSample = sampleData[Object.keys(sampleData)[0]];
                  setReport(firstSample);
                }
              }}
              placeholder="예: 역삼동 123-45"
              buttonLabel="검색"
            />
            {searchQuery && report && (
              <p className="text-xs text-emerald-600 mt-3">
                주소가 확인되었습니다.
              </p>
            )}
            <p className="text-sm text-navy-500 mt-3 flex items-center">
              <span className="mr-2">💡</span>
              도로명/지번 주소를 검색 후 결과를 선택해 주세요.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <FaMapMarkerAlt className="text-accent-dark" />
            <span className="font-semibold text-navy-900">{selectedAddress}</span>
            <button
              className="ml-2 text-xs text-navy-500 underline hover:text-accent"
              onClick={() => {
                setSelectedAddress(null)
                setSearchQuery('')
                setReport(null)
              }}
            >
              주소 변경
            </button>
          </div>
        )}
      </div>

      {/* 검색 결과 */}

      {/* 주소가 선택되면 항상 설문 결과(평판 리포트) 컴포넌트 노출 */}
      {selectedAddress && report && (
        <div>
          <LandlordReportComponent
            report={report}
            overrideAverageEvaluation={resultOverrides[report.address]?.averageEvaluation ?? null}
            overrideTopKeywords={resultOverrides[report.address]?.topKeywords ?? []}
            onWriteReputation={handleOpenReputationForm}
            onGoHome={handleGoHomeAll}
          />
        </div>
      )}

      {!report && !isLoading && searchQuery && (
        <div className="card text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-4xl text-gray-400" />
          </div>
          <h4 className="text-xl font-bold text-navy-900 mb-2">등록된 평판이 없어요</h4>
          <p className="text-navy-600 mb-4">이 주소에는 아직 평판이 등록되지 않았습니다</p>
          <p className="text-sm text-navy-500">
            다음 예시로 확인해보세요:
            <br/>
            <span className="font-semibold text-accent-dark">역삼동 123-45</span> 또는 
            <span className="font-semibold text-accent-dark"> 서교동 456-78</span> 또는
            <span className="font-semibold text-accent-dark"> 종로 789-12</span>
          </p>
        </div>
      )}

      {/* 홈 화면(검색창 하단)에 임대인 평판 작성하기 버튼 노출 */}
      {!report && !showReputationForm && (
        <div className="flex flex-col items-center mt-10">
          <button
            className="w-full bg-gradient-to-r from-accent to-accent-dark hover:shadow-lg text-white font-bold py-3 px-4 rounded-xl transition"
            onClick={handleOpenReputationForm}
          >
            평판 제보하기
          </button>
        </div>
      )}
    </div>
  );
}