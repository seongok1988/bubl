'use client'

import { useState } from 'react'
import { FaPhone, FaCheckCircle, FaBuilding } from 'react-icons/fa'

interface ConsultForm {
  requestType: 'sell' | 'buy'
  name: string
  phone: string
  message: string
}

export default function ConsultSection() {
  const [form, setForm] = useState<ConsultForm>({
    requestType: 'buy',
    name: '',
    phone: '',
    message: '',
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!form.name || !form.phone || !form.message) {
      alert('모든 항목을 입력해주세요.')
      return
    }

    // 실제로는 Supabase에 저장하거나 이메일 전송
    console.log('상담 신청:', form)
    
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setForm({
        requestType: 'buy',
        name: '',
        phone: '',
        message: '',
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-premium text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-4xl text-white" />
          </div>
          <h3 className="text-3xl font-bold text-navy-900 mb-3">
            상담 신청 완료
          </h3>
          <p className="text-navy-600 mb-6 text-lg">
            영업일 기준 <span className="font-bold text-accent-dark">1~2일 내</span>로 연락드리겠습니다
          </p>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-accent-light/30">
            <p className="text-sm text-navy-700 space-y-1">
              <span className="block font-semibold text-accent-dark mb-2">신청 정보</span>
              <span className="block">문의 유형: {form.requestType === 'sell' ? '팔아요 🏪' : '구해요 🔍'}</span>
              <span className="block">이름: {form.name}</span>
              <span className="block">연락처: {form.phone}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card-premium px-6 py-8 md:px-8 md:py-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FaBuilding className="text-2xl text-accent-dark" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-2">맞춤 상담 신청</h3>
          <p className="text-sm text-navy-600">
            부동산 전문가가 <span className="font-semibold text-accent-dark">무료</span>로 도와드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 팔아요/구해요 선택 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-navy-900">
              문의 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, requestType: 'sell' })}
                className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                  form.requestType === 'sell'
                    ? 'bg-accent text-white border-accent shadow-lg'
                    : 'bg-white text-navy-700 border-gray-200 hover:border-accent'
                }`}
              >
                🏪 팔아요
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, requestType: 'buy' })}
                className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                  form.requestType === 'buy'
                    ? 'bg-accent text-white border-accent shadow-lg'
                    : 'bg-white text-navy-700 border-gray-200 hover:border-accent'
                }`}
              >
                🔍 구해요
              </button>
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-navy-900">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
              className="input-field"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-navy-900">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
              className="input-field"
            />
            <p className="text-xs text-navy-500 mt-2">
              연락 가능한 번호를 입력해 주세요.
            </p>
          </div>

          {/* 상담 내용 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-navy-900">
              상담 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder={
                form.requestType === 'sell'
                  ? '예) 강남역 근처 1층 상가를 팔고 싶습니다. 권리금 3억, 월세 300/50입니다.'
                  : '예) 홍대 근처 음식점 가능한 상가를 찾고 있습니다. 보증금 1억 이하 희망합니다.'
              }
              rows={5}
              required
              className="input-field resize-none"
            />
            <p className="text-xs text-navy-500 mt-2">
              💡 위치, 예산, 업종 등을 자세히 적어주시면 더 정확한 상담이 가능합니다
            </p>
          </div>

          {/* 제출 버튼 */}
          <button type="submit" className="btn btn-primary w-full text-base py-3">
            <FaPhone className="inline mr-2" />
            무료 상담 요청 보내기
          </button>
        </form>

        {/* 안내 사항 */}
        <div className="mt-6 p-5 bg-navy-50 rounded-xl border border-navy-100">
          <h4 className="font-bold mb-3 flex items-center text-navy-900">
            <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center mr-2">
              <span className="text-white text-xs">📋</span>
            </div>
            상담 프로세스
          </h4>
          <div className="space-y-2 text-xs text-navy-700">
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-accent text-white rounded-full text-center leading-6 mr-3 flex-shrink-0 font-bold">1</span>
              <span>상담 신청서 접수</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-accent text-white rounded-full text-center leading-6 mr-3 flex-shrink-0 font-bold">2</span>
              <span>전문가 배정 (영업일 기준 1~2일)</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-accent text-white rounded-full text-center leading-6 mr-3 flex-shrink-0 font-bold">3</span>
              <span>전화 또는 대면 상담 진행</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-accent text-white rounded-full text-center leading-6 mr-3 flex-shrink-0 font-bold">4</span>
              <span>필요 시 중개사 연결</span>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <FaPhone className="text-2xl text-accent-dark mb-2" />
            <h5 className="font-bold mb-1 text-navy-900">전화 상담</h5>
            <p className="text-sm text-navy-700 font-semibold">1588-0000</p>
            <p className="text-xs text-navy-500">평일 09:00 - 18:00</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="text-2xl mb-2">📧</div>
            <h5 className="font-bold mb-1 text-navy-900">이메일 문의</h5>
            <p className="text-sm text-navy-700 font-semibold">contact@sangablah.com</p>
            <p className="text-xs text-navy-500">24시간 접수 가능</p>
          </div>
        </div>
      </div>
    </div>
  )
}
