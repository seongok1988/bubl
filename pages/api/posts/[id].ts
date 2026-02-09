import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Invalid id' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = authHeader.split(' ')[1]
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' })
  const user = userData.user

  if (req.method === 'PUT') {
    const { title, content } = req.body
    if (!title || !content) return res.status(400).json({ error: 'Missing fields' })
    if (title.length > 200) return res.status(400).json({ error: 'Title too long' })

    // confirm ownership
    const { data: post, error: fetchErr } = await supabase.from('posts').select('user_id').eq('id', id).single()
    if (fetchErr) return res.status(500).json({ error: fetchErr.message })
    if (!post || post.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const { data, error } = await supabaseAdmin.from('posts').update({ title, content }).eq('id', id).select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data?.[0] ?? null)
  }

  if (req.method === 'DELETE') {
    const { data: post, error: fetchErr } = await supabase.from('posts').select('user_id').eq('id', id).single()
    if (fetchErr) return res.status(500).json({ error: fetchErr.message })
    if (!post || post.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
