import type { NextApiRequest, NextApiResponse } from 'next'

// Use a server-only Kakao REST API key (do NOT expose as NEXT_PUBLIC_)
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: '검색어가 필요합니다.' })
  }
  try {
    const kakaoRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
      }
    )
    const data = await kakaoRes.json()
    res.status(kakaoRes.status).json(data)
  } catch (e: any) {
    res.status(500).json({ error: e.message || '카카오 주소 검색 실패' })
  }
}
