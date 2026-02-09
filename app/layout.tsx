import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '부블 - 상가 임대인 리포트 & 커뮤니티',
  description: '임차인을 위한 상가 임대인 성향 분석 및 익명 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
