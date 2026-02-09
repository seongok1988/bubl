'use client'

import { useEffect, useState } from 'react'
import { FaPlus, FaTimes } from 'react-icons/fa'

interface Post {
  id: string
  title: string
  content: string
  author: string
  timestamp: string
  views: number
  likes: number
  comments: number
  category: 'experience' | 'question' | 'warning'
  isLiked?: boolean
  dislikes?: number
  isDisliked?: boolean
  imageUrls?: string[]
}

interface CommentItem {
  id: string
  text: string
  author: string
  timestamp: string
  createdAt?: number
  isSecret: boolean
  isMine: boolean
  likes: number
  isLiked?: boolean
  dislikes: number
  isDisliked?: boolean
  replies?: ReplyItem[]
}

interface ReplyItem {
  id: string
  text: string
  author: string
  timestamp: string
  createdAt?: number
  isMine: boolean
  replies?: ReplyItem[]
}

export default function CommunitySection() {
  const initialPosts: Post[] = [
    {
      id: '1',
      title: '역삼동 상가 계약 후기 - 보증금 돌려받았어요!',
      content: '작년에 계약했던 상가 보증금 전액 받았습니다. 임대인분이 계약서대로 잘 지켜주셔서 감사했어요. 다만 수리 요청은 좀 늦게...',
      author: '익명123',
      timestamp: '2024-02-05 14:30',
      views: 1240,
      likes: 24,
      dislikes: 2,
      comments: 8,
      category: 'experience',
      isLiked: false,
      isDisliked: false,
    },
    {
      id: '2',
      title: '[주의] 홍대 ○○빌딩 임대인 조심하세요',
      content: '계약 당시와 다르게 관리비를 계속 올리려고 하시네요. 증빙 자료 요청해도 제대로 안주시고... 계약하실 분들 참고하세요.',
      author: '익명456',
      timestamp: '2024-02-05 12:15',
      views: 980,
      likes: 45,
      dislikes: 4,
      comments: 15,
      category: 'warning',
      isLiked: false,
      isDisliked: false,
    },
    {
      id: '3',
      title: '상가 임대차 계약 시 꼭 확인해야 할 것들?',
      content: '처음 상가 계약하는데 뭘 확인해야 할지 모르겠어요. 선배님들 조언 부탁드립니다!',
      author: '익명789',
      timestamp: '2024-02-05 10:00',
      views: 640,
      likes: 12,
      dislikes: 1,
      comments: 23,
      category: 'question',
      isLiked: false,
      isDisliked: false,
    },
  ]
  const initialComments: Record<string, CommentItem[]> = {
    '1': [
      { id: '1-1', text: '보증금 잘 돌려주는 임대인 흔치 않아요.', author: '익명201', timestamp: '2024-02-06 09:12', createdAt: Date.parse('2024-02-06 09:12'), isSecret: false, isMine: false, likes: 2, dislikes: 0, replies: [] },
      { id: '1-2', text: '수리 늦었다는 부분 공감합니다.', author: '익명332', timestamp: '2024-02-06 10:45', createdAt: Date.parse('2024-02-06 10:45'), isSecret: false, isMine: false, likes: 1, dislikes: 0, replies: [] },
    ],
    '2': [
      { id: '2-1', text: '정보 감사합니다. 비슷한 경험 있었어요.', author: '익명418', timestamp: '2024-02-06 12:20', createdAt: Date.parse('2024-02-06 12:20'), isSecret: false, isMine: false, likes: 3, dislikes: 0, replies: [] },
      { id: '2-2', text: '관리비 증빙은 꼭 요구해야 해요.', author: '익명509', timestamp: '2024-02-06 13:02', createdAt: Date.parse('2024-02-06 13:02'), isSecret: false, isMine: false, likes: 0, dislikes: 0, replies: [] },
    ],
    '3': [
      { id: '3-1', text: '저도 첫 계약인데 도움 많이 됩니다!', author: '익명117', timestamp: '2024-02-06 15:08', createdAt: Date.parse('2024-02-06 15:08'), isSecret: false, isMine: false, likes: 4, dislikes: 0, replies: [] },
      { id: '3-2', text: '체크리스트 공유해주실 수 있나요?', author: '익명784', timestamp: '2024-02-06 16:41', createdAt: Date.parse('2024-02-06 16:41'), isSecret: false, isMine: false, likes: 1, dislikes: 0, replies: [] },
    ],
  }
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  const [isWriting, setIsWriting] = useState(false)
  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentSecretDrafts, setCommentSecretDrafts] = useState<Record<string, boolean>>({})
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replyOpenIds, setReplyOpenIds] = useState<Record<string, boolean>>({})
  const [replyVisibleIds, setReplyVisibleIds] = useState<Record<string, boolean>>({})
  const [editingReplyIds, setEditingReplyIds] = useState<Record<string, string | null>>({})
  const [editingReplyDrafts, setEditingReplyDrafts] = useState<Record<string, string>>({})
  const [editingChildReplyIds, setEditingChildReplyIds] = useState<Record<string, string | null>>({})
  const [editingChildReplyDrafts, setEditingChildReplyDrafts] = useState<Record<string, string>>({})
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentItem[]>>(initialComments)
  const [editingCommentIds, setEditingCommentIds] = useState<Record<string, string | null>>({})
  const [editingCommentDrafts, setEditingCommentDrafts] = useState<Record<string, string>>({})
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [myPostIds, setMyPostIds] = useState<Record<string, boolean>>({})
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingPostTitle, setEditingPostTitle] = useState('')
  const [editingPostContent, setEditingPostContent] = useState('')
  const [localCommentsReady, setLocalCommentsReady] = useState(false)
  const [localPostsReady, setLocalPostsReady] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'experience' as Post['category'],
  })
  const [newPostImages, setNewPostImages] = useState<File[]>([])
  const [newPostImageUrls, setNewPostImageUrls] = useState<string[]>([])
  const [imageError, setImageError] = useState('')

  const MAX_IMAGES = 5
  const MAX_IMAGE_SIZE_MB = 5

  const mergePosts = (stored: Post[] | null) => {
    if (!stored || !Array.isArray(stored)) return initialPosts
    const seen = new Set(stored.map((post) => post.id))
    const merged = [...stored]
    initialPosts.forEach((post) => {
      if (!seen.has(post.id)) merged.push(post)
    })
    return merged
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('communityPosts')
      const parsedPosts = stored ? (JSON.parse(stored) as Post[]) : null
      setPosts(mergePosts(parsedPosts))
      const storedMyPostIds = localStorage.getItem('communityMyPostIds')
      if (storedMyPostIds) {
        const parsedMyPostIds = JSON.parse(storedMyPostIds) as Record<string, boolean>
        if (parsedMyPostIds && typeof parsedMyPostIds === 'object') {
          setMyPostIds(parsedMyPostIds)
        }
      }
    } catch (error) {
      console.error('Failed to load community posts:', error)
    } finally {
      setLocalPostsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!localPostsReady) return
    try {
      localStorage.setItem('communityPosts', JSON.stringify(posts))
      localStorage.setItem('communityMyPostIds', JSON.stringify(myPostIds))
    } catch (error) {
      console.error('Failed to save community posts:', error)
    }
  }, [posts, myPostIds, localPostsReady])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('communityComments')
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CommentItem[]>
        if (parsed && typeof parsed === 'object') {
          setCommentsByPost((prev) => ({ ...prev, ...parsed }))
        }
      }
    } catch (error) {
      console.error('Failed to load community comments:', error)
    } finally {
      setLocalCommentsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!localCommentsReady) return
    try {
      localStorage.setItem('communityComments', JSON.stringify(commentsByPost))
    } catch (error) {
      console.error('Failed to save community comments:', error)
    }
  }, [commentsByPost, localCommentsReady])

  const handleImageChange = (files: FileList | null) => {
    if (!files) return

    setImageError('')
    const selectedFiles = Array.from(files)
    const remainingSlots = Math.max(0, MAX_IMAGES - newPostImages.length)
    const nextFiles: File[] = []
    const nextUrls: string[] = []

    for (const file of selectedFiles) {
      if (nextFiles.length >= remainingSlots) break
      if (!file.type.startsWith('image/')) {
        setImageError('이미지 파일만 업로드할 수 있어요.')
        continue
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImageError(`이미지는 ${MAX_IMAGE_SIZE_MB}MB 이하만 업로드할 수 있어요.`)
        continue
      }
      nextFiles.push(file)
      nextUrls.push(URL.createObjectURL(file))
    }

    if (nextFiles.length === 0) return
    setNewPostImages((prev) => [...prev, ...nextFiles])
    setNewPostImageUrls((prev) => [...prev, ...nextUrls])
  }

  const handleRemoveImage = (index: number) => {
    setNewPostImages((prev) => prev.filter((_, i) => i !== index))
    setNewPostImageUrls((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      if (removed) URL.revokeObjectURL(removed)
      return next
    })
  }

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const nextLiked = !post.isLiked
        const nextLikes = Math.max(0, post.likes + (nextLiked ? 1 : -1))
        const nextDisliked = nextLiked ? false : post.isDisliked
        const nextDislikes = nextLiked && post.isDisliked
          ? Math.max(0, (post.dislikes ?? 0) - 1)
          : (post.dislikes ?? 0)
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLikes,
          isDisliked: nextDisliked,
          dislikes: nextDislikes,
        }
      })
    )
  }

  const handleDislike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const currentDislikes = post.dislikes ?? 0
        const nextDisliked = !post.isDisliked
        const nextDislikes = Math.max(0, currentDislikes + (nextDisliked ? 1 : -1))
        const nextLiked = nextDisliked ? false : post.isLiked
        const nextLikes = nextDisliked && post.isLiked ? Math.max(0, post.likes - 1) : post.likes
        return {
          ...post,
          isDisliked: nextDisliked,
          dislikes: nextDislikes,
          isLiked: nextLiked,
          likes: nextLikes,
        }
      })
    )
  }

  const handleToggleComment = (postId: string) => {
    setOpenCommentId(prev => (prev === postId ? null : postId))
  }

  const handleSubmitComment = (postId: string) => {
    const text = (commentDrafts[postId] || '').trim()
    if (!text) {
      alert('댓글을 입력해주세요.')
      return
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    )
    const newComment: CommentItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      author: `익명${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('ko-KR'),
      createdAt: Date.now(),
      isSecret: !!commentSecretDrafts[postId],
      isMine: true,
      likes: 0,
      isLiked: false,
      dislikes: 0,
      isDisliked: false,
      replies: [],
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }))
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }))
    setCommentSecretDrafts(prev => ({ ...prev, [postId]: false }))
  }

  const handleEditComment = (postId: string, comment: CommentItem) => {
    if (!comment.isMine) return
    setEditingCommentIds((prev) => ({ ...prev, [postId]: comment.id }))
    setEditingCommentDrafts((prev) => ({ ...prev, [comment.id]: comment.text }))
  }

  const handleCancelEditComment = (postId: string, commentId: string) => {
    setEditingCommentIds((prev) => ({ ...prev, [postId]: null }))
    setEditingCommentDrafts((prev) => {
      const next = { ...prev }
      delete next[commentId]
      return next
    })
  }

  const handleSaveComment = (postId: string, commentId: string) => {
    const target = (commentsByPost[postId] || []).find((comment) => comment.id === commentId)
    if (!target?.isMine) return
    const text = (editingCommentDrafts[commentId] || '').trim()
    if (!text) {
      alert('댓글을 입력해주세요.')
      return
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) =>
        comment.id === commentId ? { ...comment, text } : comment
      ),
    }))
    handleCancelEditComment(postId, commentId)
  }

  const handleDeleteComment = (postId: string, commentId: string) => {
    const target = (commentsByPost[postId] || []).find((comment) => comment.id === commentId)
    if (!target?.isMine) return
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((comment) => comment.id !== commentId),
    }))
    if (editingCommentIds[postId] === commentId) {
      handleCancelEditComment(postId, commentId)
    }
  }

  const handleToggleReply = (commentId: string) => {
    setReplyOpenIds((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleToggleReplyList = (commentId: string) => {
    setReplyVisibleIds((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleCancelReplyDraft = (commentId: string) => {
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
    setReplyOpenIds((prev) => ({ ...prev, [commentId]: false }))
  }

  const handleSubmitReply = (postId: string, commentId: string) => {
    const text = (replyDrafts[commentId] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }
    const newReply: ReplyItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      author: `익명${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('ko-KR'),
      createdAt: Date.now(),
      isMine: true,
      replies: [],
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ),
    }))
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
    setReplyOpenIds((prev) => ({ ...prev, [commentId]: false }))
  }

  const handleSubmitReplyToReply = (postId: string, commentId: string, replyId: string) => {
    const text = (replyDrafts[replyId] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }
    const newReply: ReplyItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      author: `익명${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('ko-KR'),
      createdAt: Date.now(),
      isMine: true,
      replies: [],
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        return {
          ...comment,
          replies: (comment.replies || []).map((reply) =>
            reply.id === replyId
              ? { ...reply, replies: [...(reply.replies || []), newReply] }
              : reply
          ),
        }
      }),
    }))
    setReplyDrafts((prev) => ({ ...prev, [replyId]: '' }))
    setReplyOpenIds((prev) => ({ ...prev, [replyId]: false }))
  }

  const handleEditReply = (commentId: string, reply: ReplyItem) => {
    if (!reply.isMine) return
    setEditingReplyIds((prev) => ({ ...prev, [commentId]: reply.id }))
    setEditingReplyDrafts((prev) => ({ ...prev, [reply.id]: reply.text }))
  }

  const handleCancelEditReply = (commentId: string, replyId: string) => {
    setEditingReplyIds((prev) => ({ ...prev, [commentId]: null }))
    setEditingReplyDrafts((prev) => {
      const next = { ...prev }
      delete next[replyId]
      return next
    })
  }

  const handleSaveReply = (postId: string, commentId: string, replyId: string) => {
    const target = (commentsByPost[postId] || [])
      .find((comment) => comment.id === commentId)
      ?.replies?.find((reply) => reply.id === replyId)
    if (!target?.isMine) return
    const text = (editingReplyDrafts[replyId] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        return {
          ...comment,
          replies: (comment.replies || []).map((reply) =>
            reply.id === replyId ? { ...reply, text } : reply
          ),
        }
      }),
    }))
    handleCancelEditReply(commentId, replyId)
  }

  const handleEditChildReply = (parentReplyId: string, childReply: ReplyItem) => {
    if (!childReply.isMine) return
    setEditingChildReplyIds((prev) => ({ ...prev, [parentReplyId]: childReply.id }))
    setEditingChildReplyDrafts((prev) => ({ ...prev, [childReply.id]: childReply.text }))
  }

  const handleCancelEditChildReply = (parentReplyId: string, childReplyId: string) => {
    setEditingChildReplyIds((prev) => ({ ...prev, [parentReplyId]: null }))
    setEditingChildReplyDrafts((prev) => {
      const next = { ...prev }
      delete next[childReplyId]
      return next
    })
  }

  const handleSaveChildReply = (postId: string, commentId: string, parentReplyId: string, childReplyId: string) => {
    const target = (commentsByPost[postId] || [])
      .find((comment) => comment.id === commentId)
      ?.replies?.find((reply) => reply.id === parentReplyId)
      ?.replies?.find((childReply) => childReply.id === childReplyId)
    if (!target?.isMine) return
    const text = (editingChildReplyDrafts[childReplyId] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        return {
          ...comment,
          replies: (comment.replies || []).map((reply) => {
            if (reply.id !== parentReplyId) return reply
            return {
              ...reply,
              replies: (reply.replies || []).map((childReply) =>
                childReply.id === childReplyId ? { ...childReply, text } : childReply
              ),
            }
          }),
        }
      }),
    }))
    handleCancelEditChildReply(parentReplyId, childReplyId)
  }

  const handleDeleteChildReply = (postId: string, commentId: string, parentReplyId: string, childReplyId: string) => {
    const target = (commentsByPost[postId] || [])
      .find((comment) => comment.id === commentId)
      ?.replies?.find((reply) => reply.id === parentReplyId)
      ?.replies?.find((childReply) => childReply.id === childReplyId)
    if (!target?.isMine) return
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        return {
          ...comment,
          replies: (comment.replies || []).map((reply) => {
            if (reply.id !== parentReplyId) return reply
            return {
              ...reply,
              replies: (reply.replies || []).filter((childReply) => childReply.id !== childReplyId),
            }
          }),
        }
      }),
    }))
    if (editingChildReplyIds[parentReplyId] === childReplyId) {
      handleCancelEditChildReply(parentReplyId, childReplyId)
    }
  }

  const handleDeleteReply = (postId: string, commentId: string, replyId: string) => {
    const target = (commentsByPost[postId] || [])
      .find((comment) => comment.id === commentId)
      ?.replies?.find((reply) => reply.id === replyId)
    if (!target?.isMine) return
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        return {
          ...comment,
          replies: (comment.replies || []).filter((reply) => reply.id !== replyId),
        }
      }),
    }))
    if (editingReplyIds[commentId] === replyId) {
      handleCancelEditReply(commentId, replyId)
    }
  }

  const handleToggleCommentLike = (postId: string, commentId: string) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        const currentLikes = comment.likes ?? 0
        const currentDislikes = comment.dislikes ?? 0
        const nextLiked = !comment.isLiked
        const nextLikes = Math.max(0, currentLikes + (nextLiked ? 1 : -1))
        const nextDisliked = nextLiked ? false : comment.isDisliked
        const nextDislikes = nextLiked && comment.isDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes
        return {
          ...comment,
          isLiked: nextLiked,
          likes: nextLikes,
          isDisliked: nextDisliked,
          dislikes: nextDislikes,
        }
      }),
    }))
  }

  const handleToggleCommentDislike = (postId: string, commentId: string) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        const currentLikes = comment.likes ?? 0
        const currentDislikes = comment.dislikes ?? 0
        const nextDisliked = !comment.isDisliked
        const nextDislikes = Math.max(0, currentDislikes + (nextDisliked ? 1 : -1))
        const nextLiked = nextDisliked ? false : comment.isLiked
        const nextLikes = nextDisliked && comment.isLiked ? Math.max(0, currentLikes - 1) : currentLikes
        return {
          ...comment,
          isDisliked: nextDisliked,
          dislikes: nextDislikes,
          isLiked: nextLiked,
          likes: nextLikes,
        }
      }),
    }))
  }

  const handleCancelCommentDraft = (postId: string) => {
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }))
    setCommentSecretDrafts(prev => ({ ...prev, [postId]: false }))
    setOpenCommentId((prev) => (prev === postId ? null : prev))
  }

  const handleSubmitPost = () => {
    if (!newPost.title || !newPost.content) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: '익명' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleString('ko-KR'),
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      category: newPost.category,
      isLiked: false,
      isDisliked: false,
      imageUrls: newPostImageUrls.length ? newPostImageUrls : undefined,
    }

    setPosts((prev) => [post, ...prev])
    setMyPostIds((prev) => ({ ...prev, [post.id]: true }))
    setNewPost({ title: '', content: '', category: 'experience' })
    setNewPostImages([])
    setNewPostImageUrls([])
    setImageError('')
    setIsWriting(false)
    alert('게시글이 등록되었습니다!')
  }

  const handleCancelWriting = () => {
    newPostImageUrls.forEach((url) => URL.revokeObjectURL(url))
    setNewPostImages([])
    setNewPostImageUrls([])
    setImageError('')
    setIsWriting(false)
  }

  const handleEditPost = (post: Post) => {
    if (!myPostIds[post.id]) return
    setSelectedPostId(post.id)
    setEditingPostId(post.id)
    setEditingPostTitle(post.title)
    setEditingPostContent(post.content)
  }

  const handleCancelEditPost = () => {
    setEditingPostId(null)
    setEditingPostTitle('')
    setEditingPostContent('')
  }

  const handleSavePost = (id: string) => {
    if (!myPostIds[id]) return
    if (!editingPostTitle.trim() || !editingPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, title: editingPostTitle.trim(), content: editingPostContent.trim() }
          : post
      )
    )
    handleCancelEditPost()
  }

  const handleDeletePost = (id: string) => {
    if (!myPostIds[id]) return
    if (!window.confirm('이 글을 삭제하시겠습니까?')) {
      return
    }
    setPosts((prev) => prev.filter((post) => post.id !== id))
    setMyPostIds((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (editingPostId === id) {
      handleCancelEditPost()
    }
    if (selectedPostId === id) {
      setSelectedPostId(null)
    }
  }

  const selectedPost = selectedPostId ? posts.find((post) => post.id === selectedPostId) : null
  const isDetailView = !!selectedPost
  const visiblePosts = selectedPost ? [selectedPost] : posts

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-3xl font-bold text-navy-900">커뮤니티</h3>
        <p className="text-navy-600 mt-2">
          익명으로 경험을 공유하고 중요한 정보를 빠르게 확인하세요.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="badge badge-success">경험담</span>
          <span className="badge badge-gold">질문</span>
          <span className="badge badge-warning">주의</span>
        </div>
      </div>
      {/* 글쓰기 버튼 */}
      <div className="card-premium mb-6">
        <button
          onClick={() => setIsWriting(true)}
          disabled={isWriting}
          className={`btn w-full ${isWriting ? 'btn-outline' : 'btn-primary'}`}
        >
          <>
            <FaPlus className="inline mr-2" />
            {isWriting ? '작성 중' : '새 글 작성'}
          </>
        </button>
      </div>

      {/* 글쓰기 폼 */}
      {isWriting && (
        <div className="card mb-6">
          <h3 className="text-2xl font-bold mb-6 text-navy-900">글 작성</h3>
          
          <div className="mb-5">
            <label className="block text-sm font-bold mb-3 text-navy-900">카테고리</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'experience', label: '💼 경험담' },
                { value: 'question', label: '❓ 질문' },
                { value: 'warning', label: '⚠️ 주의' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewPost({ ...newPost, category: cat.value as Post['category'] })}
                  className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                    newPost.category === cat.value
                      ? 'bg-accent text-white border-accent shadow-lg'
                      : 'bg-white text-navy-700 border-gray-200 hover:border-accent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold mb-2 text-navy-900">제목</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="input-field"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold mb-2 text-navy-900">내용</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="내용을 입력하세요 (익명으로 작성됩니다)"
              rows={6}
              className="input-field resize-none"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold mb-2 text-navy-900">사진 첨부</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e.target.files)}
              className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-navy-700 hover:file:bg-navy-100"
            />
            <p className="text-xs text-navy-500 mt-2">
              최대 {MAX_IMAGES}장, 장당 {MAX_IMAGE_SIZE_MB}MB 이하의 이미지 파일만 업로드할 수 있어요.
            </p>
            {imageError && (
              <p className="text-xs text-red-500 mt-2">{imageError}</p>
            )}
            {newPostImageUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {newPostImageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSubmitPost} className="btn btn-primary w-full">
            등록하기
          </button>
          <button onClick={handleCancelWriting} className="btn btn-outline w-full mt-3">
            <FaTimes className="inline mr-2" />
            취소
          </button>
        </div>
      )}

      {/* 게시글 목록 */}
      {isDetailView && (
        <button
          onClick={() => {
            setSelectedPostId(null)
            setOpenCommentId(null)
          }}
          className="text-base font-semibold text-navy-700 hover:text-accent"
        >
          ← 목록으로
        </button>
      )}
      <div className={isDetailView ? 'space-y-5 mt-3' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
        {visiblePosts.map((post) => (
          <div
            key={post.id}
            className={
              isDetailView
                ? 'bg-white/95 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow-md'
                : 'bg-white/90 backdrop-blur rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-accent/30 transition-all cursor-pointer'
            }
            onClick={() => {
              if (!isDetailView) {
                setSelectedPostId(post.id)
                setOpenCommentId(post.id)
                setPosts((prev) =>
                  prev.map((item) =>
                    item.id === post.id ? { ...item, views: item.views + 1 } : item
                  )
                )
              }
            }}
          >
            <div className="flex flex-col gap-2">
              {isDetailView && (
                <div className="space-y-2">
                  <h4 className="text-2xl md:text-3xl font-bold text-navy-900">
                    {post.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-navy-500">
                    <span className="px-2 py-1 rounded-full bg-navy-50 border border-navy-100">
                      {post.author}
                    </span>
                    <span className="text-navy-300">·</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
                    post.category === 'experience'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : post.category === 'question'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {post.category === 'experience' && '경험담'}
                  {post.category === 'question' && '질문'}
                  {post.category === 'warning' && '주의'}
                </span>
                {!isDetailView && (
                  <h4 className="text-base font-semibold text-navy-900 line-clamp-1">
                    {post.title}
                  </h4>
                )}
                {myPostIds[post.id] && (
                  <div className="ml-auto flex items-center text-xs font-semibold text-navy-500">
                    <button
                      className="hover:text-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditPost(post)
                      }}
                    >
                      수정
                    </button>
                    <span className="mx-2 text-navy-300">|</span>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.id)
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-navy-600 mt-3 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-navy-500">
              {!isDetailView && (
                <span className="px-2 py-1 rounded-full bg-navy-50 border border-navy-100">
                  {post.author}
                </span>
              )}
              <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                👁 {post.views}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(post.id)
                }}
                className={`px-2 py-1 rounded-full border text-xs font-semibold transition ${
                  post.isLiked
                    ? 'text-accent-dark border-accent/40 bg-accent/10'
                    : 'border-gray-100 hover:text-accent-dark hover:border-accent/40'
                }`}
              >
                👍 {post.likes}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDislike(post.id)
                }}
                className={`px-2 py-1 rounded-full border text-xs font-semibold transition ${
                  post.isDisliked
                    ? 'text-red-600 border-red-200 bg-red-50'
                    : 'border-gray-100 hover:text-red-600 hover:border-red-200'
                }`}
              >
                👎 {post.dislikes ?? 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleComment(post.id)
                }}
                className="px-2 py-1 rounded-full border border-gray-100 text-xs font-semibold hover:text-accent-dark hover:border-accent/40 transition"
              >
                💬 {post.comments}
              </button>
            </div>

            {openCommentId === post.id && (
              <div
                className="mt-5 rounded-2xl border border-navy-100 bg-navy-50/60 p-4"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-navy-700">댓글 작성</span>
                  <span className="text-[11px] text-navy-400">게시글 아래에 등록됩니다</span>
                </div>
                <input
                  type="text"
                  value={commentDrafts[post.id] || ''}
                  onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="댓글을 입력하세요"
                  className="input-field py-2.5 text-sm bg-white"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <label className="flex items-center gap-2 text-xs text-navy-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!commentSecretDrafts[post.id]}
                      onChange={(e) =>
                        setCommentSecretDrafts((prev) => ({ ...prev, [post.id]: e.target.checked }))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    비밀 댓글로 남기기
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSubmitComment(post.id)
                      }}
                      className="px-4 py-2 bg-navy-700 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition whitespace-nowrap"
                    >
                      등록
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelCommentDraft(post.id)
                      }}
                      className="px-4 py-2 border border-gray-200 text-navy-600 rounded-lg text-sm font-semibold hover:border-navy-300 transition whitespace-nowrap"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {openCommentId === post.id && (
              <div
                className="mt-4 rounded-2xl border border-gray-100 bg-white/80 p-4"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-navy-700">댓글 목록</span>
                  <span className="text-[11px] text-navy-400">
                    {(commentsByPost[post.id] || []).length}개
                  </span>
                </div>
                {(commentsByPost[post.id] || []).length > 0 ? (
                  [...(commentsByPost[post.id] || [])]
                    .sort((a, b) => {
                      const aTime = (a.createdAt ?? Date.parse(a.timestamp)) || 0
                      const bTime = (b.createdAt ?? Date.parse(b.timestamp)) || 0
                      return bTime - aTime
                    })
                    .map((comment) => {
                    const isEditing = editingCommentIds[post.id] === comment.id
                    return (
                    <div
                      key={`${post.id}-comment-${comment.id}`}
                      className="text-sm text-navy-700 px-1 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCommentDrafts[comment.id] || ''}
                            onChange={(e) =>
                              setEditingCommentDrafts((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            className="input-field py-1 text-sm bg-white flex-1 min-w-0"
                          />
                          <button
                            onClick={() => handleSaveComment(post.id, comment.id)}
                            className="text-xs text-accent-dark hover:text-accent whitespace-nowrap"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => handleCancelEditComment(post.id, comment.id)}
                            className="text-xs text-navy-500 hover:text-navy-700 whitespace-nowrap"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-navy-500 mb-1 flex flex-wrap items-center gap-1">
                              {comment.isSecret && (
                                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">비밀</span>
                              )}
                              <span>{comment.author}</span>
                              <span className="text-navy-300">·</span>
                              <span>{comment.timestamp}</span>
                            </div>
                            <span>
                              {comment.isSecret && !(comment.isMine || myPostIds[post.id])
                                ? '비밀 댓글입니다.'
                                : comment.text}
                            </span>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleCommentLike(post.id, comment.id)
                                }}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold transition ${
                                  comment.isLiked
                                    ? 'border-accent/40 bg-accent/10 text-accent-dark'
                                    : 'border-gray-200 text-navy-500 hover:text-accent-dark hover:border-accent/40'
                                }`}
                              >
                                👍 좋아요{Number.isFinite(comment.likes) ? ` ${comment.likes}` : ''}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleCommentDislike(post.id, comment.id)
                                }}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold transition ${
                                  comment.isDisliked
                                    ? 'border-red-200 bg-red-50 text-red-600'
                                    : 'border-gray-200 text-navy-500 hover:text-red-600 hover:border-red-200'
                                }`}
                              >
                                👎 안좋아요{Number.isFinite(comment.dislikes) ? ` ${comment.dislikes}` : ''}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleReply(comment.id)
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 font-semibold text-navy-500 hover:text-navy-700 hover:border-navy-300 transition"
                              >
                                답글
                              </button>
                            </div>
                            {replyOpenIds[comment.id] && (
                              <div
                                className="mt-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3"
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              >
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="text"
                                    value={replyDrafts[comment.id] || ''}
                                    onChange={(e) =>
                                      setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))
                                    }
                                    placeholder="답글을 입력하세요"
                                    className="input-field py-2 text-sm bg-white w-full"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSubmitReply(post.id, comment.id)
                                      }}
                                      className="px-3 py-2 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition"
                                    >
                                      등록
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCancelReplyDraft(comment.id)
                                      }}
                                      className="px-3 py-2 border border-gray-200 text-navy-600 rounded-lg text-xs font-semibold hover:border-navy-300 transition"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {(comment.replies || []).length > 0 && (
                              <div className="mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleReplyList(comment.id)
                                  }}
                                  className="text-xs font-semibold text-navy-600 hover:text-accent"
                                >
                                  {replyVisibleIds[comment.id]
                                    ? '답글 숨기기'
                                    : `답글 보기 ${comment.replies?.length || 0}`}
                                </button>
                                {replyVisibleIds[comment.id] && (
                                  <div className="mt-3 space-y-2 border border-accent/20 bg-accent/5 rounded-lg px-4 py-3">
                                    {[...(comment.replies || [])]
                                      .sort((a, b) => {
                                        const aTime = (a.createdAt ?? Date.parse(a.timestamp)) || 0
                                        const bTime = (b.createdAt ?? Date.parse(b.timestamp)) || 0
                                        return bTime - aTime
                                      })
                                      .map((reply) => {
                                      const isEditingReply = editingReplyIds[comment.id] === reply.id
                                      return (
                                        <div key={reply.id} className="text-sm text-navy-700">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                              <div className="text-xs text-navy-500 mb-1">
                                                {reply.author}
                                                <span className="ml-1">· {reply.timestamp}</span>
                                              </div>
                                              {isEditingReply ? (
                                                <div className="flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    value={editingReplyDrafts[reply.id] || ''}
                                                    onChange={(e) =>
                                                      setEditingReplyDrafts((prev) => ({
                                                        ...prev,
                                                        [reply.id]: e.target.value,
                                                      }))
                                                    }
                                                    className="input-field py-1 text-sm bg-white flex-1 min-w-0"
                                                  />
                                                  <button
                                                    onClick={() => handleSaveReply(post.id, comment.id, reply.id)}
                                                    className="text-xs text-accent-dark hover:text-accent whitespace-nowrap"
                                                  >
                                                    저장
                                                  </button>
                                                  <button
                                                    onClick={() => handleCancelEditReply(comment.id, reply.id)}
                                                    className="text-xs text-navy-500 hover:text-navy-700 whitespace-nowrap"
                                                  >
                                                    취소
                                                  </button>
                                                </div>
                                              ) : (
                                                <div>{reply.text}</div>
                                              )}
                                              {!isEditingReply && (
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleToggleReply(reply.id)
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 font-semibold text-navy-500 hover:text-navy-700 hover:border-navy-300 transition"
                                                  >
                                                    답글
                                                  </button>
                                                </div>
                                              )}
                                              {replyOpenIds[reply.id] && (
                                                <div
                                                  className="mt-2 rounded-lg border border-gray-100 bg-gray-50/60 p-2"
                                                  onClick={(e) => e.stopPropagation()}
                                                  onFocus={(e) => e.stopPropagation()}
                                                >
                                                  <div className="flex flex-col gap-2">
                                                    <input
                                                      type="text"
                                                      value={replyDrafts[reply.id] || ''}
                                                      onChange={(e) =>
                                                        setReplyDrafts((prev) => ({
                                                          ...prev,
                                                          [reply.id]: e.target.value,
                                                        }))
                                                      }
                                                      placeholder="답글 입력"
                                                      className="input-field py-2 text-xs bg-white w-full"
                                                    />
                                                    <div className="flex items-center justify-end gap-2">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          handleSubmitReplyToReply(post.id, comment.id, reply.id)
                                                        }}
                                                        className="px-3 py-1.5 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition whitespace-nowrap"
                                                      >
                                                        등록
                                                      </button>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          handleCancelReplyDraft(reply.id)
                                                        }}
                                                        className="px-3 py-1.5 border border-gray-200 text-navy-600 rounded-lg text-xs font-semibold hover:border-navy-300 transition whitespace-nowrap"
                                                      >
                                                        취소
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              {(reply.replies || []).length > 0 && (
                                                <div className="mt-3">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleToggleReplyList(reply.id)
                                                    }}
                                                    className="text-xs font-semibold text-navy-600 hover:text-accent"
                                                  >
                                                    {replyVisibleIds[reply.id]
                                                      ? '답글 숨기기'
                                                      : `답글 보기 ${reply.replies?.length || 0}`}
                                                  </button>
                                                  {replyVisibleIds[reply.id] && (
                                                    <div className="mt-2 space-y-2 border border-navy-100 rounded-lg p-3">
                                                      {[...(reply.replies || [])]
                                                        .sort((a, b) => {
                                                          const aTime = (a.createdAt ?? Date.parse(a.timestamp)) || 0
                                                          const bTime = (b.createdAt ?? Date.parse(b.timestamp)) || 0
                                                          return bTime - aTime
                                                        })
                                                        .map((childReply) => {
                                                        const isEditingChild = editingChildReplyIds[reply.id] === childReply.id
                                                        return (
                                                          <div key={childReply.id} className="text-sm text-navy-700">
                                                            <div className="flex items-start justify-between gap-3">
                                                              <div className="flex-1">
                                                                <div className="text-xs text-navy-500 mb-1">
                                                                  {childReply.author}
                                                                  <span className="ml-1">· {childReply.timestamp}</span>
                                                                </div>
                                                                {isEditingChild ? (
                                                                  <div className="flex items-center gap-2">
                                                                    <input
                                                                      type="text"
                                                                      value={editingChildReplyDrafts[childReply.id] || ''}
                                                                      onChange={(e) =>
                                                                        setEditingChildReplyDrafts((prev) => ({
                                                                          ...prev,
                                                                          [childReply.id]: e.target.value,
                                                                        }))
                                                                      }
                                                                      className="input-field py-1 text-xs bg-white flex-1 min-w-0"
                                                                    />
                                                                    <button
                                                                      onClick={() =>
                                                                        handleSaveChildReply(
                                                                          post.id,
                                                                          comment.id,
                                                                          reply.id,
                                                                          childReply.id
                                                                        )
                                                                      }
                                                                      className="text-xs text-accent-dark hover:text-accent whitespace-nowrap"
                                                                    >
                                                                      저장
                                                                    </button>
                                                                    <button
                                                                      onClick={() =>
                                                                        handleCancelEditChildReply(reply.id, childReply.id)
                                                                      }
                                                                      className="text-xs text-navy-500 hover:text-navy-700 whitespace-nowrap"
                                                                    >
                                                                      취소
                                                                    </button>
                                                                  </div>
                                                                ) : (
                                                                  <div>{childReply.text}</div>
                                                                )}
                                                              </div>
                                                              {childReply.isMine && !isEditingChild && (
                                                                <div className="flex items-center gap-2 text-xs font-semibold text-navy-500">
                                                                  <button
                                                                    onClick={() => handleEditChildReply(reply.id, childReply)}
                                                                    className="hover:text-accent"
                                                                  >
                                                                    수정
                                                                  </button>
                                                                  <span className="text-navy-300">|</span>
                                                                  <button
                                                                    onClick={() =>
                                                                      handleDeleteChildReply(
                                                                        post.id,
                                                                        comment.id,
                                                                        reply.id,
                                                                        childReply.id
                                                                      )
                                                                    }
                                                                    className="text-red-500 hover:text-red-600"
                                                                  >
                                                                    삭제
                                                                  </button>
                                                                </div>
                                                              )}
                                                            </div>
                                                          </div>
                                                        )
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            {reply.isMine && !isEditingReply && (
                                              <div className="flex items-center gap-2 text-xs font-semibold text-navy-500">
                                                <button
                                                  onClick={() => handleEditReply(comment.id, reply)}
                                                  className="hover:text-accent"
                                                >
                                                  수정
                                                </button>
                                                <span className="text-navy-300">|</span>
                                                <button
                                                  onClick={() => handleDeleteReply(post.id, comment.id, reply.id)}
                                                  className="text-red-500 hover:text-red-600"
                                                >
                                                  삭제
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {comment.isMine && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-navy-500">
                              <button
                                className="hover:text-accent"
                                onClick={() => handleEditComment(post.id, comment)}
                              >
                                수정
                              </button>
                              <span className="text-navy-300">|</span>
                              <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-navy-500">아직 댓글이 없습니다.</div>
                )}
              </div>
            )}

            {isDetailView && openCommentId === post.id && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPostId(null)
                    setOpenCommentId(null)
                  }}
                  className="text-sm font-semibold text-navy-600 hover:text-accent"
                >
                  목록으로 가기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>


      {/* 안내 메시지 */}
      <div className="card mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <h4 className="font-bold text-navy-900 mb-3 flex items-center">
          <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center mr-2 text-white text-sm">!</span>
          커뮤니티 이용 안내
        </h4>
        <ul className="text-sm text-navy-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">🔒</span>
            <span>모든 게시글은 익명으로 작성됩니다</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⚖️</span>
            <span>허위 사실 유포 시 법적 책임이 있을 수 있습니다</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚫</span>
            <span>개인정보(주소, 이름, 연락처)는 직접 기재하지 마세요</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
