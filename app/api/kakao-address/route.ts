import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'query 파라미터가 필요합니다.' }, { status: 400 })
  }

  const KAKAO_KEY = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
  if (!KAKAO_KEY) {
    return NextResponse.json({ error: '서버에 Kakao REST API 키가 설정되어 있지 않습니다.' }, { status: 500 })
  }

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
      },
    })

    const text = await res.text()
    const contentType = res.headers.get('content-type') || ''

    if (!res.ok) {
      // Forward Kakao's error body if possible
      let body: any = text
      try { body = JSON.parse(text) } catch (e) {}
      return NextResponse.json({ error: 'Kakao API 오류', details: body }, { status: res.status })
    }

    if (contentType.includes('application/json')) {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    }

    // Fallback: return raw text
    return new NextResponse(text, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: '검색 중 오류 발생', details: e.message }, { status: 500 })
  }
}