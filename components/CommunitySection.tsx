
'use client'
import React, { useState, useEffect } from 'react'
import { FaPlus, FaRegSmile, FaRegCommentDots, FaThumbsUp, FaThumbsDown, FaRegComment } from 'react-icons/fa'
import { supabase } from '../lib/supabase'

export default function CommunitySection() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [category, setCategory] = useState('전체')
  const [showForm, setShowForm] = useState(false)
  const categories = ['전체', '경험담', '질문', '주의사항']
  const [votes, setVotes] = useState<{ [postId: string]: 'up' | 'down' | null }>({})
    const [commentOpen, setCommentOpen] = useState<{ [postId: string]: boolean }>({})
    const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({})
    const [comments, setComments] = useState<{ [postId: string]: string[] }>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingPostTitle, setEditingPostTitle] = useState('')
  const [editingPostContent, setEditingPostContent] = useState('')

  // load current user id
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        setCurrentUserId(user?.id ?? null)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])
  // 댓글 버튼 클릭 시 입력창 토글
  const handleToggleComment = (postId: string) => {
    setCommentOpen(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  // 댓글 입력값 변경
  const handleCommentInput = (postId: string, value: string) => {
    setCommentInput(prev => ({ ...prev, [postId]: value }))
  }

  // 댓글 등록
  const handleSubmitComment = (postId: string) => {
    const value = (commentInput[postId] || '').trim()
    if (!value) return
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId] ? [...prev[postId], value] : [value]
    }))
    setCommentInput(prev => ({ ...prev, [postId]: '' }))
  }

  useEffect(() => {
    fetchPosts()
  }, [category])

  async function fetchPosts() {
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (category !== '전체') query = query.eq('category', category)
    const { data, error } = await query
    if (!error) setPosts(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const session = await supabase.auth.getSession()
    const access_token = session.data?.session?.access_token
    if (!access_token) {
      window.dispatchEvent(new CustomEvent('bubl:open-login'))
      setLoading(false)
      return
    }
    try {
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({ community_id: '84ef0c08-1541-49ff-968c-7df7239520a8', title, content, category })
      })
      if (!resp.ok) throw new Error(await resp.text())
      setTitle('')
      setContent('')
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      console.error('Post failed', err)
      alert('게시글 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      {/* 상단 소개글 */}
      <div className="text-center m-0 p-0">
        <h2 className="text-3xl md:text-4xl font-bold text-accent-dark mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>
          부동산의 모든 이야기가 모이는 공간
        </h2>
        <p className="text-navy-500 text-lg md:text-xl leading-relaxed">
          묻고, 나누고, 함께 성장합니다.<br />
          부블 커뮤니티에서 경험과 인사이트를 나누세요.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex justify-center gap-2 mt-4 mb-6">
        {categories.filter(c => c !== '전체').map(cat => {
          let color = '';
          if (cat === '경험담') color = category === cat ? 'bg-blue-100 text-blue-900 border-blue-100' : 'bg-blue-50 text-blue-700 border-blue-50 hover:border-blue-200';
          if (cat === '질문') color = category === cat ? 'bg-green-100 text-green-900 border-green-100' : 'bg-green-50 text-green-700 border-green-50 hover:border-green-200';
          if (cat === '주의사항') color = category === cat ? 'bg-red-100 text-red-900 border-red-100' : 'bg-red-50 text-red-700 border-red-50 hover:border-red-200';
          return (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full font-semibold border transition-all text-sm shadow-sm ${color} ${category === cat ? 'shadow-lg scale-105' : ''}`}
              onClick={() => setCategory(cat)}
              style={{ minWidth: 80 }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="flex justify-center mb-8">
        <button
          className="w-full max-w-3xl bg-gradient-to-r from-accent/80 via-accent to-accent-dark text-white font-bold py-2.5 rounded-full shadow-lg hover:scale-[1.02] hover:shadow-xl transition flex items-center justify-center gap-3 text-lg md:text-xl"
          onClick={() => setShowForm(true)}
        >
          <span className="flex items-center gap-2">
            <FaPlus className="text-xl md:text-2xl" />
            <span>글쓰기</span>
          </span>
        </button>
      </div>

      {/* 글쓰기 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h4 className="text-xl font-bold mb-4">새 게시글 작성</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full p-3 border rounded-xl" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} />
              <textarea className="w-full p-3 border rounded-xl resize-none" rows={6} placeholder="내용" value={content} onChange={e => setContent(e.target.value)} required maxLength={10000} />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded-xl font-semibold" onClick={() => setShowForm(false)}>취소</button>
                <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-accent to-accent-dark text-white font-bold rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition">
                  {loading ? '작성중...' : '게시하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-2 text-center text-navy-400 py-12">
            <FaRegCommentDots className="mx-auto text-4xl mb-2" />
            아직 게시글이 없습니다.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-accent-dark bg-accent/10 px-3 py-1 rounded-full">{post.category || '기타'}</span>
                <span className="text-xs text-navy-400">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              {editingPostId === post.id ? (
                <div className="mb-4">
                  <input className="w-full p-2 border rounded mb-2" value={editingPostTitle} onChange={e => setEditingPostTitle(e.target.value)} />
                  <textarea className="w-full p-2 border rounded mb-2" rows={4} value={editingPostContent} onChange={e => setEditingPostContent(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-accent text-white rounded" onClick={async () => {
                      try {
                        const session = await supabase.auth.getSession();
                        const token = session.data?.session?.access_token
                        if (!token) throw new Error('로그인이 필요합니다.')
                        const res = await fetch('/api/posts', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: post.id, title: editingPostTitle, content: editingPostContent }) })
                        if (!res.ok) throw new Error(await res.text())
                        setEditingPostId(null)
                        fetchPosts()
                      } catch (e) {
                        alert('저장 실패: ' + String(e))
                      }
                    }}>저장</button>
                    <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setEditingPostId(null)}>취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <h5 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-accent-dark transition">{post.title}</h5>
                  <p className="text-navy-700 mb-4 line-clamp-3">{post.content}</p>
                </>
              )}
              <div className="flex items-center gap-2">
                <FaRegSmile className="text-accent" />
                <span className="text-xs text-navy-500">{post.author || '익명'}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full transition ${votes[post.id]==='up' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                  onClick={() => handleVote(post.id, 'up')}
                  style={{ boxShadow: 'none', border: 'none' }}
                >
                  <FaThumbsUp className="text-xs" /> 좋아요
                  <span className="ml-1 text-[11px] font-semibold">{votes[post.id]==='up' ? 1 : 0}</span>
                </button>
                <button
                  className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full transition ${votes[post.id]==='down' ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                  onClick={() => handleVote(post.id, 'down')}
                  style={{ boxShadow: 'none', border: 'none' }}
                >
                  <FaThumbsDown className="text-xs" /> 안좋아요
                  <span className="ml-1 text-[11px] font-semibold">{votes[post.id]==='down' ? 1 : 0}</span>
                </button>
                <button
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full transition bg-gray-50 text-gray-500 hover:bg-accent/10 hover:text-accent-dark"
                  style={{ boxShadow: 'none', border: 'none' }}
                  onClick={() => handleToggleComment(post.id)}
                >
                  <FaRegComment className="text-xs" /> 댓글
                </button>

                {/* 작성자이면 수정/삭제 버튼 표시 */}
                {(post.author_id || post.author) && String(post.author_id || post.author) === String(currentUserId) && (
                  <div className="ml-auto flex items-center gap-2">
                    <button className="text-xs text-navy-700 hover:text-accent" onClick={() => {
                      setEditingPostId(post.id)
                      setEditingPostTitle(post.title)
                      setEditingPostContent(post.content)
                    }}>수정</button>
                    <button className="text-xs text-red-500 hover:text-red-700" onClick={async () => {
                      if (!confirm('이 글을 삭제하시겠습니까?')) return
                      try {
                        const session = await supabase.auth.getSession()
                        const token = session.data?.session?.access_token
                        if (!token) throw new Error('로그인이 필요합니다.')
                        const res = await fetch('/api/posts', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: post.id }) })
                        if (!res.ok) throw new Error(await res.text())
                        fetchPosts()
                      } catch (e) {
                        alert('삭제 실패: ' + String(e))
                      }
                    }}>삭제</button>
                  </div>
                )}
              </div>
              {/* 댓글 입력창 및 목록 */}
              {commentOpen[post.id] && (
                <div className="mt-2">
                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 border rounded px-2 py-1 text-xs"
                      placeholder="댓글을 입력하세요"
                      value={commentInput[post.id] || ''}
                      onChange={e => handleCommentInput(post.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSubmitComment(post.id) }}
                      maxLength={200}
                    />
                    <button
                      className="px-3 py-1 bg-accent text-white rounded text-xs font-semibold"
                      onClick={() => handleSubmitComment(post.id)}
                    >등록</button>
                  </div>
                  <div className="space-y-1">
                    {(comments[post.id] || []).map((c, idx) => (
                      <div key={idx} className="bg-gray-50 rounded px-2 py-1 text-xs text-navy-700">{c}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

  // 좋아요/싫어요 클릭 핸들러 (토글)
  const handleVote = (postId: string, type: 'up' | 'down') => {
    setVotes(prev => {
      if (prev[postId] === type) {
        // 이미 선택된 상태에서 다시 클릭하면 취소
        return { ...prev, [postId]: null }
      } else {
        // 한 번만 선택 가능
        return { ...prev, [postId]: type }
      }
    })
    // 실제 서비스라면 여기서 supabase에 투표 결과 저장 API 호출 필요
  }
