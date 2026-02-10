import fs from 'fs'

const args = process.argv.slice(2)
if (!args[0]) {
  console.error('Usage: node insert_smoke_post.mjs <community_id>')
  process.exit(1)
}
const communityId = args[0]

function readEnv(path = '.env.local') {
  const src = fs.readFileSync(path, 'utf8')
  return src.split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^([^=]+)=(.*)$/)
    if (m) acc[m[1].trim()] = m[2].trim()
    return acc
  }, {})
}

const env = readEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

;(async () => {
  try {
    const base = SUPABASE_URL.replace(/\/$/, '')
    // ensure community exists
    const commUrl = `${base}/rest/v1/communities`
    const commBody = { id: communityId, name: 'dev-temp', description: '임시 커뮤니티' }
    let commRes = await fetch(commUrl, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(commBody)
    })
    if (!commRes.ok) {
      const txt = await commRes.text()
      // ignore conflict (already exists) and continue
      if (commRes.status !== 409) {
        console.error('Create community failed:', commRes.status, commRes.statusText, txt)
        process.exit(2)
      }
    }

    // insert post
    const url = `${base}/rest/v1/posts`
    const body = {
      community_id: communityId,
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'smoke-test',
      content: '자동 삽입 테스트'
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    })

    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) {
      console.error('Insert failed:', res.status, res.statusText, data)
      process.exit(2)
    }
    console.log('Inserted rows:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Unexpected error:', e)
    process.exit(3)
  }
})()
