'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuthUser } from '@/lib/hooks/useAuthUser'
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa'
import LandlordReportComponent from './LandlordReportComponent'
import type { LandlordEvaluation, LandlordReport, ReputationSubmitSummary } from '@/types/db'
import KakaoAddressSearch from './KakaoAddressSearch'
import { fetchLandlordReportByAddress } from '@/lib/api/landlordReport'

interface SearchSectionProps {
  showReputationForm: boolean
  setShowReputationForm: (v: boolean) => void
}

export default function SearchSection({ showReputationForm, setShowReputationForm }: SearchSectionProps) {
  const { user } = useAuthUser();
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

  useEffect(() => {
    if (!showReputationForm) {
      setSelectedAddress(null)
      setSearchQuery('')
      setReport(null)
    }
  }, [showReputationForm])

  const persistSubmittedAddresses = (next: Record<string, boolean>) => {
    try {
      localStorage.setItem('submittedAddresses', JSON.stringify(next))
      try {
        window.dispatchEvent(new CustomEvent('bubl:storage-changed', { detail: { key: 'submittedAddresses' } }))
      } catch {}
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

  const sampleData: Record<string, LandlordReport> = {}

  const handleSearch = async (address?: string) => {
    setIsLoading(true)
    const trimmed = (address ?? searchQuery).trim()
    if (!trimmed) {
      setReport(null)
      setIsLoading(false)
      return
    }
    try {
      const realReport = await fetchLandlordReportByAddress(trimmed)
      if (realReport) {
        setReport({
          ...realReport,
          landlordName: realReport.landlordName || '',
          rating: realReport.rating || 0,
          totalReviews: realReport.totalReviews || 0,
          positiveTraits: realReport.positiveTraits || [],
          negativeTraits: realReport.negativeTraits || [],
          recommendations: realReport.recommendations || 0,
          warnings: realReport.warnings || 0,
          evaluation: realReport.evaluation,
          userNotes: realReport.userNotes || '',
          reviews: realReport.reviews || [],
        })
      } else {
        const sampleKeys = Object.keys(sampleData)
        if (sampleKeys.length > 0) {
          const randomKey = sampleKeys[Math.floor(Math.random() * sampleKeys.length)]
          const randomSample = sampleData[randomKey]
          setReport({ ...randomSample, address: trimmed, evaluation: randomSample.evaluation })
        } else {
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
          })
        }
      }
    } catch (e) {
      const sampleKeys = Object.keys(sampleData)
      if (sampleKeys.length > 0) {
        const randomKey = sampleKeys[Math.floor(Math.random() * sampleKeys.length)]
        const randomSample = sampleData[randomKey]
        setReport({ ...randomSample, address: trimmed, evaluation: randomSample.evaluation })
      } else {
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
        })
      }
    }
    setIsLoading(false)
  }

  const handleOpenReputationForm = () => {
    if (!user) {
      try { window.dispatchEvent(new CustomEvent('bubl:open-login')) } catch {}
      return;
    }
    setReport(null);
    setSearchQuery('');
    setSelectedAddress(null);
    setShowReputationForm(true);
  }

  const handleGoHomeAll = () => {
    setSelectedAddress(null)
    setSearchQuery('')
    setReport(null)
    setIsLoading(false)
    setTimeout(() => {
      const tabs = document.querySelector('[data-tabnav]')
      if (tabs) {
        const top = (tabs as HTMLElement).getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' })
      }
    }, 10)
  }

  const defaultReport: LandlordReport = {
    address: '',
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
  }

  const formReport = report || defaultReport
  const isAddressLocked = !!(formReport && formReport.address && submittedAddresses[formReport.address])

  const handleAddressSelect = async (address: string) => {
    setSearchQuery(address)
    setSelectedAddress(address)
    await handleSearch(address)
  }

  const handleBackWithScroll = () => {
    setShowReputationForm(false)
    setTimeout(() => {
      const tabs = document.querySelector('[data-tabnav]')
      if (tabs) {
        const top = (tabs as HTMLElement).getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' })
      }
    }, 10)
  }

  const handleReputationSubmitted = async (summary: ReputationSubmitSummary) => {
    setSubmittedAddresses((prev) => {
      const next = { ...prev, [summary.address]: true }
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
    await handleSearch(summary.address)
    setShowReputationForm(false)
  }

  return (
    <>
      {showReputationForm ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div ref={formContainerRef} className="w-full max-w-2xl space-y-4">
            <div ref={reputationHeaderRef} className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900">평판 제보하기</h2>
            </div>
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
              <KakaoAddressSearch onSelect={handleAddressSelect} placeholder="예: 역삼동 123-45" buttonLabel="검색" />
              {searchQuery && report && (
                <p className="text-xs text-emerald-600 mt-3">주소가 확인되었습니다.</p>
              )}
              {searchQuery && !report && (
                <p className="text-xs text-navy-500 mt-3">검색 결과가 없어요.<span className="ml-2">주소를 다시 확인해 주세요.</span></p>
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
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="card-premium mb-8">
            <h3 className="text-2xl font-bold mb-3 flex items-center text-navy-900">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mr-3">
                <FaMapMarkerAlt className="text-accent-dark" />
              </div>
              부동산 평판 조회
            </h3>
            <p className="text-sm text-navy-600 mb-5">카카오 주소 검색을 통해 임대인 평판과 리뷰를 확인하세요.</p>
            {!selectedAddress ? (
              <>
                <KakaoAddressSearch onSelect={handleAddressSelect} placeholder="예: 역삼동 123-45" buttonLabel="검색" />
                {searchQuery && report && <p className="text-xs text-emerald-600 mt-3">주소가 확인되었습니다.</p>}
                <p className="text-sm text-navy-500 mt-3 flex items-center"><span className="mr-2">💡</span>도로명/지번 주소를 검색 후 결과를 선택해 주세요.</p>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <FaMapMarkerAlt className="text-accent-dark" />
                <span className="font-semibold text-navy-900">{selectedAddress}</span>
                <button className="ml-2 text-xs text-navy-500 underline hover:text-accent" onClick={() => { setSelectedAddress(null); setSearchQuery(''); setReport(null); }}>주소 변경</button>
              </div>
            )}
          </div>

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
              <p className="text-sm text-navy-500">다음 예시로 확인해보세요:<br/><span className="font-semibold text-accent-dark">역삼동 123-45</span> 또는 <span className="font-semibold text-accent-dark">서교동 456-78</span> 또는 <span className="font-semibold text-accent-dark">종로 789-12</span></p>
            </div>
          )}

          {!report && !showReputationForm && (
            <div className="flex flex-col items-center mt-10">
              <button className="w-full bg-gradient-to-r from-accent to-accent-dark hover:shadow-lg text-white font-bold py-3 px-4 rounded-xl transition" onClick={handleOpenReputationForm}>평판 제보하기</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}