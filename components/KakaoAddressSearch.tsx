import React, { useState } from 'react'
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa'

interface KakaoAddressSearchProps {
  onSelect: (address: string) => void
  placeholder?: string
  buttonLabel?: string
  className?: string
}

const KAKAO_REST_API_KEY = '306ada6405de7dfb3fa6a24e1397885e'

export default function KakaoAddressSearch({ onSelect, placeholder = '주소 검색', buttonLabel = '검색', className = '' }: KakaoAddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError('')
    setResults([])
    try {
      const res = await fetch(`/api/kakao-address?query=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('검색 실패')
      const data = await res.json()
      setResults(data.documents || [])
      if ((data.documents || []).length === 0) setError('검색 결과가 없습니다.')
    } catch (e: any) {
      setError(e.message || '검색 중 오류 발생')
    } finally {
      setIsLoading(false)
    }
  }

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
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn btn-primary whitespace-nowrap"
            >
              <FaSearch className="inline mr-2" />
              {isLoading ? '검색 중...' : buttonLabel}
            </button>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          {results.length > 0 && (
            <ul className="border rounded bg-white max-h-48 overflow-y-auto divide-y">
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
