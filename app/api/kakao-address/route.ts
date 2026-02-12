import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY
  if (!KAKAO_REST_API_KEY) {
    return NextResponse.json({ error: 'Missing KAKAO_REST_API_KEY' }, { status: 500 })
  }

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Kakao API error', detail: err }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
