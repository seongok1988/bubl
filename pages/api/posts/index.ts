import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const rawCommunityId = req.query.communityId
    const communityId = Array.isArray(rawCommunityId) ? rawCommunityId[0] : rawCommunityId

    if (!communityId) return res.status(400).json({ error: 'Missing communityId query parameter' })

    // Validate UUID format to avoid passing invalid values to Postgres
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    if (!uuidRegex.test(communityId)) return res.status(400).json({ error: 'Invalid communityId format, expected UUID' })

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    const token = authHeader.split(' ')[1]

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' })
    const user = userData.user

    const { community_id, title, content } = req.body
    if (!community_id || !title || !content) return res.status(400).json({ error: 'Missing fields' })
    if (typeof title !== 'string' || typeof content !== 'string') return res.status(400).json({ error: 'Invalid field types' })
    if (title.length > 200) return res.status(400).json({ error: 'Title too long' })
    if (content.length > 10000) return res.status(400).json({ error: 'Content too long' })

    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert([{ community_id, user_id: user.id, title, content }])
        .select()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data?.[0] ?? null)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
