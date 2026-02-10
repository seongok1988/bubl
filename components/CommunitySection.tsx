'use client'
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CommunitySection() {
  // use the shared supabase client
  // (avoids relying on auth-helpers exports that may not be installed)
  // supabase is imported from ../lib/supabase
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const session = await supabase.auth.getSession()
    const access_token = session.data?.session?.access_token
    if (!access_token) {
      // open login modal (custom event used elsewhere in app)
      window.dispatchEvent(new CustomEvent('bubl:open-login'))
      setLoading(false)
      return
    }

    try {
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({ community_id: '84ef0c08-1541-49ff-968c-7df7239520a8', title, content })
      })
      if (!resp.ok) throw new Error(await resp.text())
      // increment local counter and clear form
      window.dispatchEvent(new CustomEvent('bubl:storage-changed', { detail: { type: 'new-post' } }))
      setTitle('')
      setContent('')
    } catch (err) {
      console.error('Post failed', err)
      alert('게시글 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h3 className="text-2xl font-bold">커뮤니티</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input className="w-full p-2 border" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full p-2 border" rows={6} placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? '작성중...' : '게시'}
          </button>
        </div>
      </form>
    </section>
  )
}
