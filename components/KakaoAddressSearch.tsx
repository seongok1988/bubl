import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa'

interface KakaoAddressSearchProps {
  onSelect: (address: string) => void
  placeholder?: string
  buttonLabel?: string
  className?: string
}

export default function KakaoAddressSearch({ onSelect, placeholder = '주소 검색', buttonLabel = '검색', className = '' }: KakaoAddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const debounceTimer = useRef<number | null>(null)
  const abortCtrl = useRef<AbortController | null>(null)

  // Core search function (can be called by Enter or by debounced typing)
  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim()
    if (!q) return

    // Abort previous request
    if (abortCtrl.current) {
      abortCtrl.current.abort()
    }
    const controller = new AbortController()
    abortCtrl.current = controller

    setIsLoading(true)
    setError('')
    setResults([])
    setSelected(null) // 검색 시 기존 선택 해제

    try {
      const res = await fetch(`/api/kakao-address?query=${encodeURIComponent(q)}`, { signal: controller.signal })
      if (!res.ok) {
        const text = await res.text()
        let details: any = text
        try { details = JSON.parse(text) } catch {} // ignore parse errors
        throw new Error(details?.message || '검색 실패')
      }
      const data = await res.json()
      const docs = data.documents || []
      setResults(docs)
      if (docs.length === 0) setError('검색 결과가 없습니다.')
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setError(e.message || '검색 중 오류 발생')
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced automatic search when typing
  useEffect(() => {
    // don't auto-search when selected is set
    if (selected) return

    // minimum 2 characters before auto-search
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setError('')
      // abort any ongoing fetch
      if (abortCtrl.current) {
        abortCtrl.current.abort()
        abortCtrl.current = null
      }
      return
    }

    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = window.setTimeout(() => {
      handleSearch(query)
    }, 400)

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current)
        debounceTimer.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current)
      if (abortCtrl.current) abortCtrl.current.abort()
    }
  }, [])

  const handleSelect = (address: string) => {
    setSelected(address)
    setResults([])
    setQuery(address)
    onSelect(address)
  }

  const handleReset = () => {
    setSelected(null)
    setQuery('')
    setResults([])
    setError('')
    if (abortCtrl.current) {
      abortCtrl.current.abort()
      abortCtrl.current = null
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {!selected ? (
        <>
          <div className="flex gap-3">
            <label htmlFor="kakao-address-search" className="sr-only">주소 검색</label>
            <input
              id="kakao-address-search"
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="input-field flex-1"
              autoComplete="off"
              aria-label="주소 검색"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="btn btn-primary whitespace-nowrap"
              aria-busy={isLoading}
            >
              <FaSearch className="inline mr-2" />
              {isLoading ? '검색 중...' : buttonLabel}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 mt-1">※ 반드시 검색 결과에서 주소를 선택해 주세요.</div>
            <div className="text-xs text-gray-400 mt-1">타입하여 자동 검색 (2자 이상)</div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-red-500" role="alert" aria-live="polite">{error}</div>
              <button
                className="text-xs underline text-navy-500 hover:text-accent"
                onClick={() => handleSearch()}
                disabled={isLoading}
              >
                다시 시도
              </button>
            </div>
          )}

          {isLoading && <div className="text-xs text-gray-500 mt-1">검색 중입니다...</div>}

          {results.length > 0 && (
            <ul className="border rounded bg-white max-h-48 overflow-y-auto divide-y mt-2">
              {results.map((item, idx) => (
                <li key={item.address_name + idx}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent/10 transition"
                    onClick={() => handleSelect(item.address_name)}
                  >
                    <FaMapMarkerAlt className="inline mr-2 text-accent-dark" />
                    {item.address_name}
                  </button>
                </li>
              ))}
            </ul>
          )}

        </>
      ) : (
        <div className="flex items-center gap-2 bg-gray-50 border rounded px-3 py-2">
          <FaMapMarkerAlt className="text-accent-dark" />
          <span className="font-semibold text-navy-900">{selected}</span>
          <button className="ml-2 text-xs text-navy-500 underline hover:text-accent" onClick={handleReset}>
            주소 변경
          </button>
        </div>
      )}
    </div>
  )
}
