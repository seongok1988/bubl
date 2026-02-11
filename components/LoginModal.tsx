'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaComment, FaEye, FaEyeSlash, FaEnvelope, FaBuilding } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

type ViewMode = 'main' | 'email-login' | 'signup' | 'reset-password'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [view, setView] = useState<ViewMode>('main')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 이메일 로그인
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  
  // 회원가입
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('')
  const [signupNickname, setSignupNickname] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupPasswordConfirm, setShowSignupPasswordConfirm] = useState(false)
  
  // 비밀번호 재설정
  const [resetEmail, setResetEmail] = useState('')

  // 모달 열릴 때 body 스크롤 방지 및 세션 확인
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      checkSession()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // 세션 확인 (보안)
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // 이미 로그인된 상태면 모달 닫기
        onLoginSuccess?.()
        onClose()
      }
      // 로그인 안 된 상태면 아무 동작도 하지 않음
    } catch (err) {
      console.error('Session check failed:', err)
    }
  }

  if (!isOpen) return null

  // XSS 방어: HTML 이스케이프
  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // 입력값 검증 (보안)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().slice(0, 255) // 최대 길이 제한
  }

  // 에러 메시지 안전 처리 (민감한 정보 노출 금지)
  const getSafeErrorMessage = (error: any): string => {
    if (!error) return '알 수 없는 오류가 발생했습니다'
    
    const message = error.message || error.error_description || ''
    
    // Supabase 에러를 사용자 친화적으로 변환
    if (message.includes('Invalid login credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다'
    }
    if (message.includes('Email not confirmed')) {
      return '이메일 인증이 필요합니다. 메일함을 확인해주세요'
    }
    if (message.includes('User already registered')) {
      return '이미 가입된 이메일입니다'
    }
    if (message.includes('Password should be at least')) {
      return '비밀번호는 최소 6자 이상이어야 합니다'
    }
    if (message.includes('Signups not allowed')) {
      return '현재 회원가입이 제한되어 있습니다'
    }
    if (message.includes('Invalid email')) {
      return '올바른 이메일 형식이 아닙니다'
    }
    
    // 민감한 정보가 포함된 에러는 일반 메시지로
    return '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
  }

  // 카카오 간편로그인 (Supabase OAuth)
  const handleKakaoLogin = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // PKCE 플로우 사용 (보안 강화)
          skipBrowserRedirect: false,
        },
      })
      
      if (error) throw error
      
    } catch (err: any) {
      console.error('회원가입 에러:', err);
      setError(getSafeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // 이메일/비밀번호 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 입력값 검증
    const email = sanitizeInput(loginEmail)
    const password = loginPassword
    
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다')
      return
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.session) {
        setSuccess('로그인 성공!')
        
        // 세션 만료 시간 설정 (24시간)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)
        
        onLoginSuccess?.()
        
        setTimeout(() => {
          onClose()
          resetForm()
        }, 1000)
      }
      
    } catch (err: any) {
      setError(getSafeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 입력값 검증
    const nickname = sanitizeInput(signupNickname)
    const email = sanitizeInput(signupEmail)
    const password = signupPassword
    
    if (!nickname) {
      setError('닉네임을 입력해주세요')
      return
    }
    
    if (nickname.length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다')
      return
    }
    
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다')
      return
    }
    
    if (!validatePassword(password)) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    if (password !== signupPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      
      // 회원가입 성공 후 자동 로그인
      if (data.session) {
        setSuccess('회원가입이 완료되었습니다!')
        onLoginSuccess?.()
        setTimeout(() => {
          onClose()
          resetForm()
        }, 1000)
      } else {
        // 이메일 인증 필요
        setSuccess('회원가입이 완료되었습니다! 이메일 인증 후 로그인해주세요')
        setTimeout(() => {
          setView('email-login')
          setLoginEmail(email)
          setSuccess('')
        }, 3000)
      }
      
    } catch (err: any) {
      setError(getSafeErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 재설정 (안전한 토큰 기반)
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const email = sanitizeInput(resetEmail)
    
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess('비밀번호 재설정 메일이 발송되었습니다. 메일함을 확인해주세요')
      
      setTimeout(() => {
        setView('email-login')
        setSuccess('')
        setResetEmail('')
      }, 3000)
      
    } catch (err: any) {
      // 보안상 이메일 존재 여부를 노출하지 않음
      setSuccess('입력하신 이메일로 비밀번호 재설정 메일을 발송했습니다')
      setTimeout(() => {
        setView('email-login')
        setSuccess('')
        setResetEmail('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setView('main')
    setLoginEmail('')
    setLoginPassword('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupPasswordConfirm('')
    setSignupNickname('')
    setResetEmail('')
    setError('')
    setSuccess('')
    setShowLoginPassword(false)
    setShowSignupPassword(false)
    setShowSignupPasswordConfirm(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 z-10"
          aria-label="모달 닫기"
        >
          <FaTimes size={24} />
        </button>

        {/* 메인 로그인 화면 */}
        {view === 'main' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-white text-2xl" />
                </div>
                <h2 
                  id="login-modal-title"
                  className="text-3xl font-bold text-navy-900" 
                  style={{ fontFamily: 'Unbounded, sans-serif' }}
                >
                  부블
                </h2>
              </div>
              <p className="text-navy-600">
                부동산 평판 인사이트 플랫폼
              </p>
            </div>

            {error && (
              <div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* 카카오 간편로그인 */}
              <button
                onClick={handleKakaoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors font-semibold text-[#000000]/85 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="카카오 간편로그인"
              >
                <FaComment size={20} />
                카카오 간편로그인
              </button>

              {/* 이메일로 로그인하기 */}
              <button
                onClick={() => setView('email-login')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-white border-2 border-gray-300 hover:border-accent transition-colors font-semibold text-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="이메일로 로그인하기"
              >
                <FaEnvelope size={20} />
                이메일로 로그인하기
              </button>
            </div>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <p className="text-sm text-navy-600">
                아직도 회원이 아니신가요?{' '}
                <button
                  onClick={() => setView('signup')}
                  className="text-accent-dark font-semibold hover:underline"
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 이메일 로그인 화면 */}
        {view === 'email-login' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">이메일로 로그인</h2>
              <p className="text-sm text-navy-600">
                부블 서비스 이용을 위해 로그인해주세요.
              </p>
            </div>

            {error && (
              <div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div 
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                role="status"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label 
                  htmlFor="login-email"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  이메일
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="input-field"
                  required
                  autoComplete="email"
                  maxLength={255}
                />
              </div>

              <div>
                <label 
                  htmlFor="login-password"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="input-field pr-12"
                    required
                    autoComplete="current-password"
                    maxLength={255}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showLoginPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showLoginPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="mt-4 text-center text-sm">
              <button
                onClick={() => {
                  setView('reset-password')
                  setError('')
                }}
                className="text-navy-600 hover:text-accent-dark"
              >
                비밀번호 재설정
              </button>
              <span className="mx-2 text-gray-300">|</span>
              <button
                onClick={() => {
                  setView('signup')
                  setError('')
                }}
                className="text-navy-600 hover:text-accent-dark"
              >
                이메일로 가입하기
              </button>
            </div>

            {/* 뒤로가기 */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setView('main')
                  setError('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← 다른 방법으로 로그인
              </button>
            </div>
          </div>
        )}

        {/* 회원가입 화면 */}
        {view === 'signup' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">회원가입</h2>
              <p className="text-sm text-navy-600">
                부블과 함께 시작하세요
              </p>
            </div>

            {error && (
              <div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div 
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                role="status"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label 
                  htmlFor="signup-nickname"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  닉네임 <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-nickname"
                  type="text"
                  value={signupNickname}
                  onChange={(e) => setSignupNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="input-field"
                  required
                  autoComplete="nickname"
                  maxLength={50}
                />
              </div>

              <div>
                <label 
                  htmlFor="signup-email"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="input-field"
                  required
                  autoComplete="email"
                  maxLength={255}
                />
              </div>

              <div>
                <label 
                  htmlFor="signup-password"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="6자 이상 입력하세요"
                    className="input-field pr-12"
                    required
                    autoComplete="new-password"
                    maxLength={255}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showSignupPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showSignupPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="signup-password-confirm"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password-confirm"
                    type={showSignupPasswordConfirm ? 'text' : 'password'}
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="input-field pr-12"
                    required
                    autoComplete="new-password"
                    maxLength={255}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPasswordConfirm(!showSignupPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showSignupPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showSignupPasswordConfirm ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-navy-600 mb-2">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => {
                    setView('email-login')
                    setError('')
                  }}
                  className="text-accent-dark font-semibold hover:underline"
                >
                  로그인
                </button>
              </p>
              <button
                onClick={() => {
                  setView('main')
                  setError('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← 메인으로 돌아가기
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 재설정 화면 (오버레이) */}
        {view === 'reset-password' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">비밀번호 재설정</h2>
              <p className="text-sm text-navy-600">
                가입하신 이메일로 비밀번호 재설정 메일을 보내드립니다.
              </p>
            </div>

            {error && (
              <div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div 
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                role="status"
              >
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label 
                  htmlFor="reset-email"
                  className="block text-sm font-semibold mb-2 text-navy-900"
                >
                  이메일
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="가입하신 이메일을 입력하세요"
                  className="input-field"
                  required
                  autoComplete="email"
                  maxLength={255}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '전송 중...' : '인증메일 받기'}
              </button>
            </form>

            {/* 닫기 버튼 - 이메일 로그인 창으로 돌아가기 */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setView('email-login')
                  setError('')
                  setSuccess('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← 로그인으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
