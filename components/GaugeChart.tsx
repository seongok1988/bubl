'use client'

interface GaugeChartProps {
  label: string
  value: number
  max?: number
  color?: string
  description?: string
}

export default function GaugeChart({ 
  label, 
  value, 
  max = 5, 
  color = 'bg-gradient-to-r from-accent to-accent-dark',
  description 
}: GaugeChartProps) {
  const percentage = (value / max) * 100

  // 값에 따른 색상 결정
  let gaugeColor = 'bg-gradient-to-r from-red-400 to-red-500'
  let textColor = 'text-red-600'
  
  if (value >= 3.5) {
    gaugeColor = 'bg-gradient-to-r from-green-400 to-emerald-500'
    textColor = 'text-green-600'
  } else if (value >= 2.5) {
    gaugeColor = 'bg-gradient-to-r from-yellow-400 to-orange-500'
    textColor = 'text-yellow-600'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-navy-900 mb-1">{label}</h4>
          {description && (
            <p className="text-sm text-navy-500">{description}</p>
          )}
        </div>
        <div className={`text-2xl font-bold ${textColor}`}>
          {value.toFixed(1)}
        </div>
      </div>

      {/* 게이지 바 */}
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* 배경 눈금 */}
        <div className="absolute inset-0 flex">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-gray-200 last:border-r-0"
            />
          ))}
        </div>

        {/* 채워지는 바 */}
        <div
          className={`h-full ${gaugeColor} transition-all duration-500 relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* 반짝임 효과 */}
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* 레이블 */}
      <div className="flex justify-between text-xs text-navy-500 mt-2">
        <span>낮음</span>
        <span>높음</span>
      </div>

      {/* 평가 텍스트 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-navy-700">
        {value >= 4 && <span className="text-green-600 font-semibold">✓ 매우 좋음</span>}
        {value >= 3 && value < 4 && <span className="text-blue-600 font-semibold">✓ 양호</span>}
        {value >= 2 && value < 3 && <span className="text-yellow-600 font-semibold">⚠ 주의</span>}
        {value < 2 && <span className="text-red-600 font-semibold">✕ 위험</span>}
      </div>
    </div>
  )
}
