'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa'
import { supabase } from '@/services/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/?error=session_expired')
      }
    }
    checkSession()
  }, [router])

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    return hasUpperCase && hasLowerCase && hasNumber
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword(password)) {
      setError('비밀번호는 8자 이상, 대소문자 및 숫자를 포함해야 합니다')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess('비밀번호가 성공적으로 변경되었습니다!')
      
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-navy-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
              <FaBuilding className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              부블
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">새 비밀번호 설정</h2>
          <p className="text-sm text-navy-600">
            새로운 비밀번호를 입력해주세요
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-navy-900">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상, 대소문자+숫자 포함"
                className="input-field pr-12"
                required
                maxLength={255}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="password-confirm" className="block text-sm font-semibold mb-2 text-navy-900">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password-confirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="input-field pr-12"
                required
                maxLength={255}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPasswordConfirm ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
