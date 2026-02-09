'use client'

import { useEffect, useState } from 'react'
import { FaStar, FaUser, FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaTrash, FaComments } from 'react-icons/fa'
import GaugeChart from './GaugeChart'
import { supabase } from '../lib/supabase'
import { createLandlordReport } from '../lib/api/landlordReport'

export interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  date: string;
  helpful: number;
  unhelpful: number;
}

interface ReviewComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isSecret: boolean;
  isMine: boolean;
  replies?: ReviewReply[];
}

interface ReviewReply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isSecret: boolean;
  isMine: boolean;
  replies?: ReviewReply[];
}

export interface LandlordEvaluation {
  negotiationFlexibility: number;
  renewalManners: number;
  interferenceIndex: number;
  maintenanceCooperation: number;
}

export interface LandlordReport {
  id?: string;
  address: string;
  landlordName: string;
  rating: number;
  totalReviews: number;
  positiveTraits: string[];
  negativeTraits: string[];
  recommendations: number;
  warnings: number;
  evaluation?: LandlordEvaluation;
  userNotes?: string;
  reviews?: Review[];
}

export interface ReputationSubmitSummary {
  address: string;
  averageEvaluation: LandlordEvaluation | null;
  topKeywords: string[];
}

interface EvaluationScore {
  negotiationFlexibility: number;
  renewalManners: number;
  interferenceIndex: number;
  maintenanceCooperation: number;
  createdAt: string;
}

interface KeywordSelection {
  keywords: string[];
  createdAt: string;
}

interface LandlordReportProps {
  report: LandlordReport;
  showOnlyForm?: boolean;
  onWriteReputation?: () => void;
  showInlineForm?: boolean;
  onSubmitSuccess?: (summary: ReputationSubmitSummary) => void;
  isAddressLocked?: boolean;
  overrideAverageEvaluation?: LandlordEvaluation | null;
  overrideTopKeywords?: string[];
  onBack?: () => void;
  onGoHome?: () => void;
}

export default function LandlordReportComponent({
  report,
  showOnlyForm = false,
  onWriteReputation,
  showInlineForm = false,
  onSubmitSuccess,
  isAddressLocked = false,
  overrideAverageEvaluation,
  overrideTopKeywords,
  onBack,
  onGoHome,
}: LandlordReportProps) {
  const LANDLORD_REPORTS_TABLE = 'landlord_reports'
  const [evaluation, setEvaluation] = useState<LandlordEvaluation>({
    negotiationFlexibility: 0,
    renewalManners: 0,
    interferenceIndex: 0,
    maintenanceCooperation: 0,
  })
  const [newReview, setNewReview] = useState('')
  const [reviews, setReviews] = useState<Review[]>(report.reviews || [])
  const [reviewVotes, setReviewVotes] = useState<Record<string, 'helpful' | 'unhelpful'>>({})
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [myReviewIds, setMyReviewIds] = useState<Record<string, boolean>>({})
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editingReviewText, setEditingReviewText] = useState('')
  const [openReviewCommentId, setOpenReviewCommentId] = useState<string | null>(null)
  const [reviewCommentDrafts, setReviewCommentDrafts] = useState<Record<string, string>>({})
  const [reviewComments, setReviewComments] = useState<Record<string, ReviewComment[]>>({})
  const [reviewCommentSecretDrafts, setReviewCommentSecretDrafts] = useState<Record<string, boolean>>({})
  const [localCommentsReady, setLocalCommentsReady] = useState(false)
  const [editingCommentIds, setEditingCommentIds] = useState<Record<string, string | null>>({})
  const [editingCommentDrafts, setEditingCommentDrafts] = useState<Record<string, string>>({})
  const [reviewReplyDrafts, setReviewReplyDrafts] = useState<Record<string, string>>({})
  const [reviewReplySecretDrafts, setReviewReplySecretDrafts] = useState<Record<string, boolean>>({})
  const [reviewReplyOpenIds, setReviewReplyOpenIds] = useState<Record<string, boolean>>({})
  const [reviewReplyVisibleIds, setReviewReplyVisibleIds] = useState<Record<string, boolean>>({})
  const [editingReviewReplyIds, setEditingReviewReplyIds] = useState<Record<string, boolean>>({})
  const [editingReviewReplyDrafts, setEditingReviewReplyDrafts] = useState<Record<string, string>>({})
  const [localEvaluationScores, setLocalEvaluationScores] = useState<EvaluationScore[]>([])
  const [averageEvaluation, setAverageEvaluation] = useState<LandlordEvaluation | null>(null)
  const [localKeywordSelections, setLocalKeywordSelections] = useState<KeywordSelection[]>([])
  const [topKeywordTags, setTopKeywordTags] = useState<string[]>([])

  const keywordOptions = [
    '친절해요',
    '응답 빨라요',
    '계약서 준수',
    '소통 원활',
    '보증금 지연',
    '임대료 인상 잦음',
    '약속 잘 지켜요',
    '응대 정중',
    '공지 명확',
    '정산 투명',
    '연락 느림',
    '상담 설명 자세함',
    '문서 전달 빠름',
  ]

  const positiveKeywords = new Set([
    '친절해요',
    '응답 빨라요',
    '계약서 준수',
    '소통 원활',
    '약속 잘 지켜요',
    '응대 정중',
    '공지 명확',
    '정산 투명',
    '상담 설명 자세함',
    '문서 전달 빠름',
  ])

  const negativeKeywords = new Set([
    '보증금 지연',
    '임대료 인상 잦음',
    '연락 느림',
  ])

  const displayEvaluation = overrideAverageEvaluation ?? averageEvaluation ?? report.evaluation
  const hasEvaluation = !!displayEvaluation
  const landlordNoteTags = selectedKeywords.length
    ? selectedKeywords
    : [...(report.positiveTraits || []), ...(report.negativeTraits || [])].filter(Boolean)
  const displayKeywordTags = overrideTopKeywords?.length
    ? overrideTopKeywords
    : topKeywordTags.length
      ? topKeywordTags
      : landlordNoteTags

  const roundToOneDecimal = (value: number) => Number(value.toFixed(1))

  const computeAverageEvaluation = (scores: EvaluationScore[]): LandlordEvaluation | null => {
    if (!scores.length) return null
    const totals = scores.reduce(
      (acc, score) => ({
        negotiationFlexibility: acc.negotiationFlexibility + score.negotiationFlexibility,
        renewalManners: acc.renewalManners + score.renewalManners,
        interferenceIndex: acc.interferenceIndex + score.interferenceIndex,
        maintenanceCooperation: acc.maintenanceCooperation + score.maintenanceCooperation,
      }),
      {
        negotiationFlexibility: 0,
        renewalManners: 0,
        interferenceIndex: 0,
        maintenanceCooperation: 0,
      }
    )

    return {
      negotiationFlexibility: roundToOneDecimal(totals.negotiationFlexibility / scores.length),
      renewalManners: roundToOneDecimal(totals.renewalManners / scores.length),
      interferenceIndex: roundToOneDecimal(totals.interferenceIndex / scores.length),
      maintenanceCooperation: roundToOneDecimal(totals.maintenanceCooperation / scores.length),
    }
  }

  const computeTopKeywords = (selections: KeywordSelection[]): string[] => {
    if (!selections.length) return []
    const counts = new Map<string, number>()
    const latest = new Map<string, number>()
    selections.forEach((selection) => {
      const timestamp = Date.parse(selection.createdAt)
      selection.keywords.forEach((keyword) => {
        counts.set(keyword, (counts.get(keyword) || 0) + 1)
        const currentLatest = latest.get(keyword) ?? 0
        if (!Number.isNaN(timestamp) && timestamp > currentLatest) {
          latest.set(keyword, timestamp)
        }
      })
    })
    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]
        const latestA = latest.get(a[0]) ?? 0
        const latestB = latest.get(b[0]) ?? 0
        return latestB - latestA
      })
      .slice(0, 5)
      .map(([keyword]) => keyword)
  }

  const loadLocalKeywordSelections = () => {
    if (report.id) return
    try {
      const stored = localStorage.getItem(`keywordSelections:${report.address}`)
      if (!stored) return
      const selections = JSON.parse(stored) as KeywordSelection[]
      if (Array.isArray(selections)) {
        setLocalKeywordSelections(selections)
      }
    } catch (error) {
      console.error('Failed to load local keyword selections:', error)
    }
  }

  const persistLocalKeywordSelections = (selections: KeywordSelection[]) => {
    if (report.id) return
    try {
      localStorage.setItem(`keywordSelections:${report.address}`, JSON.stringify(selections))
    } catch (error) {
      console.error('Failed to save local keyword selections:', error)
    }
  }

  const loadLocalEvaluationScores = () => {
    if (report.id) return
    try {
      const stored = localStorage.getItem(`evaluationScores:${report.address}`)
      if (!stored) return
      const scores = JSON.parse(stored) as EvaluationScore[]
      if (Array.isArray(scores)) {
        setLocalEvaluationScores(scores)
      }
    } catch (error) {
      console.error('Failed to load local evaluation scores:', error)
    }
  }

  const persistLocalEvaluationScores = (scores: EvaluationScore[]) => {
    if (report.id) return
    try {
      localStorage.setItem(`evaluationScores:${report.address}`, JSON.stringify(scores))
    } catch (error) {
      console.error('Failed to save local evaluation scores:', error)
    }
  }

  const loadLocalReviews = () => {
    if (report.id) return
    try {
      const stored = localStorage.getItem(`reviews:${report.address}`)
      if (!stored) return
      const parsed = JSON.parse(stored) as Review[]
      if (Array.isArray(parsed)) {
        setReviews(parsed)
      }
    } catch (error) {
      console.error('Failed to load local reviews:', error)
    }
  }

  const loadLocalReviewComments = () => {
    if (report.id) return
    try {
      const stored = localStorage.getItem(`reviewComments:${report.address}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, ReviewComment[]>
        if (parsed && typeof parsed === 'object') {
          setReviewComments((prev) => ({ ...parsed, ...prev }))
        }
      }
      setLocalCommentsReady(true)
    } catch (error) {
      console.error('Failed to load local review comments:', error)
      setLocalCommentsReady(true)
    }
  }

  const persistLocalReviewComments = (nextComments: Record<string, ReviewComment[]>) => {
    if (report.id) return
    try {
      localStorage.setItem(`reviewComments:${report.address}`, JSON.stringify(nextComments))
    } catch (error) {
      console.error('Failed to save local review comments:', error)
    }
  }

  const persistLocalReviews = (nextReviews: Review[]) => {
    if (report.id) return
    try {
      localStorage.setItem(`reviews:${report.address}`, JSON.stringify(nextReviews))
    } catch (error) {
      console.error('Failed to save local reviews:', error)
    }
  }

  const loadArrayField = async <T,>(field: 'evaluation_scores' | 'keyword_selections') => {
    if (!report.id) return [] as T[]
    const { data, error } = await supabase
      .from(LANDLORD_REPORTS_TABLE)
      .select(field)
      .eq('id', report.id)
      .maybeSingle()

    if (error) {
      console.error(`Failed to load ${field} from Supabase:`, error)
      return [] as T[]
    }

    const value = (data as Record<string, unknown> | null)?.[field]
    return Array.isArray(value) ? (value as T[]) : ([] as T[])
  }

  const appendArrayField = async <T,>(field: 'evaluation_scores' | 'keyword_selections', item: T) => {
    if (!report.id) return
    const current = await loadArrayField<T>(field)
    const next = [...current, item]
    const { error } = await supabase
      .from(LANDLORD_REPORTS_TABLE)
      .upsert({ id: report.id, [field]: next }, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  const fetchAverageEvaluation = async () => {
    if (!report.id) return
    const scores = await loadArrayField<EvaluationScore>('evaluation_scores')
    setAverageEvaluation(computeAverageEvaluation(scores))
  }

  const fetchTopKeywords = async () => {
    if (!report.id) return
    const selections = await loadArrayField<KeywordSelection>('keyword_selections')
    setTopKeywordTags(computeTopKeywords(selections))
  }

  const persistEvaluationScore = async (score: EvaluationScore) => {
    if (!report.id) return
    await appendArrayField('evaluation_scores', score)
  }

  const persistKeywordSelection = async (selection: KeywordSelection) => {
    if (!report.id) return
    await appendArrayField('keyword_selections', selection)
  }

  useEffect(() => {
    if (report.id) {
      fetchAverageEvaluation()
      fetchTopKeywords()
      return
    }
    loadLocalEvaluationScores()
    loadLocalKeywordSelections()
    loadLocalReviews()
    loadLocalReviewComments()
  }, [report.id, report.address])

  useEffect(() => {
    if (report.id || !localCommentsReady) return
    persistLocalReviewComments(reviewComments)
  }, [report.id, report.address, localCommentsReady, reviewComments])

  useEffect(() => {
    if (report.id) return
    setAverageEvaluation(computeAverageEvaluation(localEvaluationScores))
  }, [report.id, localEvaluationScores])

  useEffect(() => {
    if (report.id) return
    setTopKeywordTags(computeTopKeywords(localKeywordSelections))
  }, [report.id, localKeywordSelections])

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAddressLocked) {
      alert('이미 해당 주소에 평판이 등록되었습니다. 다른 주소를 입력해주세요.')
      return
    }
    if (!newReview.trim()) {
      alert('리뷰를 입력해주세요')
      return
    }
    if (selectedKeywords.length < 1 || selectedKeywords.length > 5) {
      alert('키워드는 1개 이상, 5개 이하로 선택해주세요.')
      return
    }
    if (
      evaluation.negotiationFlexibility === 0 ||
      evaluation.renewalManners === 0 ||
      evaluation.interferenceIndex === 0 ||
      evaluation.maintenanceCooperation === 0
    ) {
      alert('네고 유연성, 재계약 매너, 간섭 지수, 유지보수 별점을 모두 선택해주세요.')
      return
    }

    const averageRating = Math.round(
      (evaluation.negotiationFlexibility +
        evaluation.renewalManners +
        evaluation.interferenceIndex +
        evaluation.maintenanceCooperation) / 4
    )

    const evaluationScore: EvaluationScore = {
      negotiationFlexibility: evaluation.negotiationFlexibility,
      renewalManners: evaluation.renewalManners,
      interferenceIndex: evaluation.interferenceIndex,
      maintenanceCooperation: evaluation.maintenanceCooperation,
      createdAt: new Date().toISOString(),
    }

    const keywordSelection: KeywordSelection = {
      keywords: selectedKeywords,
      createdAt: new Date().toISOString(),
    }

    const newReviewItem: Review = {
      id: Date.now().toString(),
      nickname: '익명' + Math.floor(Math.random() * 1000),
      rating: averageRating,
      content: newReview,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      unhelpful: 0,
    }

    const nextReviews = [newReviewItem, ...reviews]
    setReviews(nextReviews)
    persistLocalReviews(nextReviews)
    setMyReviewIds((prev) => ({ ...prev, [newReviewItem.id]: true }))
    setNewReview('')
    setSelectedKeywords([])
    setEvaluation({
      negotiationFlexibility: 0,
      renewalManners: 0,
      interferenceIndex: 0,
      maintenanceCooperation: 0,
    })
    const nextScores = [...localEvaluationScores, evaluationScore]
    const nextSelections = [...localKeywordSelections, keywordSelection]
    const nextAverage = computeAverageEvaluation(nextScores)
    const nextTopKeywords = computeTopKeywords(nextSelections)

    setLocalEvaluationScores(nextScores)
    setAverageEvaluation(nextAverage)
    persistLocalEvaluationScores(nextScores)

    setLocalKeywordSelections(nextSelections)
    setTopKeywordTags(nextTopKeywords)
    persistLocalKeywordSelections(nextSelections)
    // Supabase에 실제 데이터 저장
    try {
      const saved = await createLandlordReport({
        address: report.address,
        evaluation: nextAverage,
        positiveTraits: nextTopKeywords.filter(k => positiveKeywords.has(k)),
        negativeTraits: nextTopKeywords.filter(k => negativeKeywords.has(k)),
        reviews: [], // 리뷰는 별도 구현 필요
      });
      onSubmitSuccess?.({
        address: report.address,
        averageEvaluation: nextAverage,
        topKeywords: nextTopKeywords,
      });
      alert('평판이 Supabase DB에 저장되었습니다!');
    } catch (error) {
      alert('Supabase 저장 실패: ' + (error?.message || error));
    }
  }


  const handleDeleteReview = (id: string) => {
    if (window.confirm('이 리뷰를 삭제하시겠습니까?')) {
      setReviews(reviews.filter((r) => r.id !== id))
      setReviewVotes((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setMyReviewIds((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id)
    setEditingReviewText(review.content)
  }

  const handleCancelEditReview = () => {
    setEditingReviewId(null)
    setEditingReviewText('')
  }

  const handleSaveReview = (id: string) => {
    const text = editingReviewText.trim()
    if (!text) {
      alert('리뷰를 입력해주세요')
      return
    }
    setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, content: text } : review)))
    handleCancelEditReview()
  }

  const handleReviewVote = (id: string, type: 'helpful' | 'unhelpful') => {
    const currentVote = reviewVotes[id]

    setReviews((prev) =>
      prev.map((review) => {
        if (review.id !== id) return review

        if (!currentVote) {
          return {
            ...review,
            helpful: type === 'helpful' ? review.helpful + 1 : review.helpful,
            unhelpful: type === 'unhelpful' ? review.unhelpful + 1 : review.unhelpful,
          }
        }

        if (currentVote === type) {
          return {
            ...review,
            helpful: type === 'helpful' ? Math.max(0, review.helpful - 1) : review.helpful,
            unhelpful: type === 'unhelpful' ? Math.max(0, review.unhelpful - 1) : review.unhelpful,
          }
        }

        return {
          ...review,
          helpful:
            type === 'helpful' ? review.helpful + 1 : Math.max(0, review.helpful - 1),
          unhelpful:
            type === 'unhelpful' ? review.unhelpful + 1 : Math.max(0, review.unhelpful - 1),
        }
      })
    )

    setReviewVotes((prev) => {
      if (!currentVote) {
        return { ...prev, [id]: type }
      }
      if (currentVote === type) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: type }
    })
  }

  const handleToggleReviewComment = (id: string) => {
    setOpenReviewCommentId((prev) => (prev === id ? null : id))
  }

  const handleSubmitReviewComment = (id: string) => {
    const text = (reviewCommentDrafts[id] || '').trim()
    if (!text) {
      alert('댓글을 입력해주세요.')
      return
    }

    const newComment: ReviewComment = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      author: `익명${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('ko-KR'),
      isSecret: !!reviewCommentSecretDrafts[id],
      isMine: true,
      replies: [],
    }
    setReviewComments((prev) => {
      const next = {
        ...prev,
        [id]: [...(prev[id] || []), newComment],
      }
      persistLocalReviewComments(next)
      return next
    })
    setReviewCommentDrafts((prev) => ({ ...prev, [id]: '' }))
    setReviewCommentSecretDrafts((prev) => ({ ...prev, [id]: false }))
  }

  const handleCancelReviewCommentInput = (id: string) => {
    setReviewCommentDrafts((prev) => ({ ...prev, [id]: '' }))
    setReviewCommentSecretDrafts((prev) => ({ ...prev, [id]: false }))
    setOpenReviewCommentId(null)
  }

  const handleToggleReviewReply = (commentId: string) => {
    setReviewReplyOpenIds((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleToggleReviewReplyList = (commentId: string) => {
    setReviewReplyVisibleIds((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleCancelReviewReply = (commentId: string) => {
    setReviewReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
    setReviewReplySecretDrafts((prev) => ({ ...prev, [commentId]: false }))
    setReviewReplyOpenIds((prev) => ({ ...prev, [commentId]: false }))
  }

  const createReviewReply = (text: string, isSecret: boolean): ReviewReply => ({
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text,
    author: `익명${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleString('ko-KR'),
    isSecret,
    isMine: true,
    replies: [],
  })

  const findReviewReply = (replies: ReviewReply[], replyId: string): ReviewReply | undefined => {
    for (const reply of replies) {
      if (reply.id === replyId) return reply
      if (reply.replies && reply.replies.length > 0) {
        const found = findReviewReply(reply.replies, replyId)
        if (found) return found
      }
    }
    return undefined
  }

  const addReviewReply = (replies: ReviewReply[], parentReplyId: string, newReply: ReviewReply): ReviewReply[] => {
    let updated = false
    const next = replies.map((reply) => {
      if (reply.id === parentReplyId) {
        updated = true
        return { ...reply, replies: [...(reply.replies || []), newReply] }
      }
      if (reply.replies && reply.replies.length > 0) {
        const nextChildren = addReviewReply(reply.replies, parentReplyId, newReply)
        if (nextChildren !== reply.replies) {
          updated = true
          return { ...reply, replies: nextChildren }
        }
      }
      return reply
    })
    return updated ? next : replies
  }

  const updateReviewReply = (
    replies: ReviewReply[],
    replyId: string,
    updater: (reply: ReviewReply) => ReviewReply
  ): ReviewReply[] => {
    let updated = false
    const next = replies.map((reply) => {
      if (reply.id === replyId) {
        updated = true
        return updater(reply)
      }
      if (reply.replies && reply.replies.length > 0) {
        const nextChildren = updateReviewReply(reply.replies, replyId, updater)
        if (nextChildren !== reply.replies) {
          updated = true
          return { ...reply, replies: nextChildren }
        }
      }
      return reply
    })
    return updated ? next : replies
  }

  const deleteReviewReply = (replies: ReviewReply[], replyId: string): ReviewReply[] => {
    let updated = false
    const next = replies
      .filter((reply) => {
        if (reply.id === replyId) {
          updated = true
          return false
        }
        return true
      })
      .map((reply) => {
        if (reply.replies && reply.replies.length > 0) {
          const nextChildren = deleteReviewReply(reply.replies, replyId)
          if (nextChildren !== reply.replies) {
            updated = true
            return { ...reply, replies: nextChildren }
          }
        }
        return reply
      })
    return updated ? next : replies
  }

  const handleSubmitReviewReply = (reviewId: string, commentId: string, parentReplyId?: string) => {
    const draftKey = parentReplyId ?? commentId
    const text = (reviewReplyDrafts[draftKey] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }

    const newReply = createReviewReply(text, !!reviewReplySecretDrafts[draftKey])

    setReviewComments((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).map((comment) => {
        if (comment.id !== commentId) return comment
        if (!parentReplyId) {
          return { ...comment, replies: [...(comment.replies || []), newReply] }
        }
        return {
          ...comment,
          replies: addReviewReply(comment.replies || [], parentReplyId, newReply),
        }
      }),
    }))

    setReviewReplyDrafts((prev) => ({ ...prev, [draftKey]: '' }))
    setReviewReplySecretDrafts((prev) => ({ ...prev, [draftKey]: false }))
    setReviewReplyOpenIds((prev) => ({ ...prev, [draftKey]: false }))
  }

  const handleEditReviewReply = (reply: ReviewReply) => {
    if (!reply.isMine) return
    setEditingReviewReplyIds((prev) => ({ ...prev, [reply.id]: true }))
    setEditingReviewReplyDrafts((prev) => ({ ...prev, [reply.id]: reply.text }))
  }

  const handleCancelEditReviewReply = (replyId: string) => {
    setEditingReviewReplyIds((prev) => {
      const next = { ...prev }
      delete next[replyId]
      return next
    })
    setEditingReviewReplyDrafts((prev) => {
      const next = { ...prev }
      delete next[replyId]
      return next
    })
  }

  const handleSaveReviewReply = (reviewId: string, commentId: string, replyId: string) => {
    const commentReplies =
      (reviewComments[reviewId] || []).find((comment) => comment.id === commentId)?.replies || []
    const target = findReviewReply(commentReplies, replyId)
    if (!target?.isMine) return

    const text = (editingReviewReplyDrafts[replyId] || '').trim()
    if (!text) {
      alert('답글을 입력해주세요.')
      return
    }

    setReviewComments((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: updateReviewReply(comment.replies || [], replyId, (reply) => ({
                ...reply,
                text,
              })),
            }
          : comment
      ),
    }))
    handleCancelEditReviewReply(replyId)
  }

  const handleDeleteReviewReply = (reviewId: string, commentId: string, replyId: string) => {
    const commentReplies =
      (reviewComments[reviewId] || []).find((comment) => comment.id === commentId)?.replies || []
    const target = findReviewReply(commentReplies, replyId)
    if (!target?.isMine) return

    setReviewComments((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: deleteReviewReply(comment.replies || [], replyId) }
          : comment
      ),
    }))
    handleCancelEditReviewReply(replyId)
  }

  const handleEditReviewComment = (reviewId: string, comment: ReviewComment) => {
    setEditingCommentIds((prev) => ({ ...prev, [reviewId]: comment.id }))
    setEditingCommentDrafts((prev) => ({ ...prev, [comment.id]: comment.text }))
  }

  const handleCancelEditReviewComment = (reviewId: string, commentId: string) => {
    setEditingCommentIds((prev) => ({ ...prev, [reviewId]: null }))
    setEditingCommentDrafts((prev) => {
      const next = { ...prev }
      delete next[commentId]
      return next
    })
  }

  const handleSaveReviewComment = (reviewId: string, commentId: string) => {
    const text = (editingCommentDrafts[commentId] || '').trim()
    if (!text) {
      alert('댓글을 입력해주세요.')
      return
    }

    setReviewComments((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).map((comment) =>
        comment.id === commentId ? { ...comment, text } : comment
      ),
    }))
    handleCancelEditReviewComment(reviewId, commentId)
  }

  const handleDeleteReviewComment = (reviewId: string, commentId: string) => {
    setReviewComments((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).filter((comment) => comment.id !== commentId),
    }))
    if (editingCommentIds[reviewId] === commentId) {
      handleCancelEditReviewComment(reviewId, commentId)
    }
  }

  const renderReviewReplies = (
    replies: ReviewReply[],
    reviewId: string,
    commentId: string,
    canViewSecretReplies: boolean,
    depth = 1
  ) => {
    if (!replies || replies.length === 0) return null

    const containerClass =
      depth % 2 === 1
        ? 'mt-2 space-y-2 border-l-2 border-gray-100 pl-3'
        : 'mt-2 space-y-2 border-l-2 border-accent/20 bg-accent/5 rounded-lg px-3 py-2'
    const metaClass = depth > 1 ? 'text-[10px] text-navy-400 mb-1' : 'text-[11px] text-navy-400 mb-1'
    const textClass = depth > 1 ? 'text-[11px] text-navy-600' : 'text-xs text-navy-600'

    return (
      <div className={containerClass}>
        {replies.map((reply) => {
          if (reply.isSecret && !(reply.isMine || canViewSecretReplies)) {
            return null
          }
          const isEditingReply = !!editingReviewReplyIds[reply.id]
          return (
            <div key={reply.id} className={textClass}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className={metaClass}>
                    {reply.isSecret && <span className="mr-1 text-amber-600">(비밀)</span>}
                    {reply.author}
                    <span className="ml-1">· {reply.timestamp}</span>
                  </div>
                  {isEditingReply ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingReviewReplyDrafts[reply.id] || ''}
                        onChange={(e) =>
                          setEditingReviewReplyDrafts((prev) => ({
                            ...prev,
                            [reply.id]: e.target.value,
                          }))
                        }
                        className="input-field py-1 text-xs bg-white flex-1 min-w-0"
                      />
                      <button
                        onClick={() => handleSaveReviewReply(reviewId, commentId, reply.id)}
                        className="text-xs text-navy-700 hover:text-accent"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => handleCancelEditReviewReply(reply.id)}
                        className="text-xs text-navy-500 hover:text-navy-700"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div>{reply.text}</div>
                  )}
                  {!isEditingReply && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <button
                        onClick={() => handleToggleReviewReply(reply.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 font-semibold text-navy-500 hover:text-navy-700 hover:border-navy-300 transition"
                      >
                        답글
                      </button>
                    </div>
                  )}
                  {reviewReplyOpenIds[reply.id] && (
                    <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2 space-y-2">
                      <input
                        type="text"
                        value={reviewReplyDrafts[reply.id] || ''}
                        onChange={(e) =>
                          setReviewReplyDrafts((prev) => ({
                            ...prev,
                            [reply.id]: e.target.value,
                          }))
                        }
                        placeholder="답글 입력"
                        className="input-field py-2 text-sm bg-white w-full"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs text-navy-500">
                          <input
                            type="checkbox"
                            checked={!!reviewReplySecretDrafts[reply.id]}
                            onChange={(e) =>
                              setReviewReplySecretDrafts((prev) => ({ ...prev, [reply.id]: e.target.checked }))
                            }
                          />
                          비밀 답글
                        </label>
                        <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSubmitReviewReply(reviewId, commentId, reply.id)}
                          className="px-3 py-1.5 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition whitespace-nowrap"
                        >
                          등록
                        </button>
                        <button
                          onClick={() => handleCancelReviewReply(reply.id)}
                          className="px-3 py-1.5 border border-gray-200 text-navy-600 rounded-lg text-xs font-semibold hover:border-navy-300 transition whitespace-nowrap"
                        >
                          취소
                        </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(reply.replies || []).length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleToggleReviewReplyList(reply.id)}
                        className="text-[11px] font-semibold text-navy-500 hover:text-accent"
                      >
                        {reviewReplyVisibleIds[reply.id]
                          ? '답글 숨기기'
                          : `답글 보기 ${reply.replies?.length || 0}`}
                      </button>
                      {reviewReplyVisibleIds[reply.id] &&
                        renderReviewReplies(reply.replies || [], reviewId, commentId, canViewSecretReplies, depth + 1)}
                    </div>
                  )}
                </div>
                {reply.isMine && !isEditingReply && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-navy-500">
                    <button onClick={() => handleEditReviewReply(reply)} className="hover:text-accent">
                      수정
                    </button>
                    <span className="text-navy-300">|</span>
                    <button
                      onClick={() => handleDeleteReviewReply(reviewId, commentId, reply.id)}
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
    )
  }

  const formContent = (
    <div className="card w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-navy-900">임대인 평판 작성</h4>
      </div>
      <form onSubmit={handleAddReview} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">네고 유연성</label>
            <p className="text-xs text-navy-500 mb-1 leading-relaxed break-words">
              임대인과의 임대료, 보증금, 렌트프리 등
              <span className="block">협상 과정에서의 유연함</span>
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setEvaluation((prev) => ({ ...prev, negotiationFlexibility: star }))}>
                  <FaStar className={star <= (evaluation?.negotiationFlexibility || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">재계약 매너</label>
            <p className="text-xs text-navy-500 mb-1 leading-relaxed break-words">계약 갱신 시 인상 폭, 태도, 재계약 조건 협의의 원만함</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setEvaluation((prev) => ({ ...prev, renewalManners: star }))}>
                  <FaStar className={star <= (evaluation?.renewalManners || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">간섭 지수</label>
            <p className="text-xs text-navy-500 mb-1 leading-relaxed break-words">운영 중 임대인의 방문 빈도, 참견, 간섭 정도</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setEvaluation((prev) => ({ ...prev, interferenceIndex: star }))}>
                  <FaStar className={star <= (evaluation?.interferenceIndex || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">유지보수</label>
            <p className="text-xs text-navy-500 mb-1 leading-relaxed break-words">하자 수리, 시설 유지보수, 비용 분담 등 임대인의 협조성</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setEvaluation((prev) => ({ ...prev, maintenanceCooperation: star }))}>
                  <FaStar className={star <= (evaluation?.maintenanceCooperation || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            키워드 선택 (1~5개)
          </label>
          <div className="flex flex-wrap gap-2">
            {keywordOptions.map((keyword) => {
              const isSelected = selectedKeywords.includes(keyword)
              const disableSelect = !isSelected && selectedKeywords.length >= 5
              const toneClass = positiveKeywords.has(keyword)
                ? 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                : negativeKeywords.has(keyword)
                  ? 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
              const selectedClass = positiveKeywords.has(keyword)
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : negativeKeywords.has(keyword)
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              return (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedKeywords((prev) => prev.filter((item) => item !== keyword))
                      return
                    }
                    if (selectedKeywords.length < 5) {
                      setSelectedKeywords((prev) => [...prev, keyword])
                    }
                  }}
                  disabled={disableSelect}
                  className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                    isSelected
                      ? selectedClass
                      : toneClass
                  } ${disableSelect ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  #{keyword}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-navy-500 mt-2">
            선택됨: {selectedKeywords.length}/5
          </p>
        </div>
        <div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="이 주소에 대한 경험을 공유해주세요. (최대 500자)"
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none transition resize-none"
          />
          <div className="text-xs text-navy-500 mt-1 text-right">{newReview.length}/500</div>
        </div>
        {isAddressLocked && (
          <p className="text-xs text-red-500">
            이미 해당 주소로 평판이 등록되었습니다. 다른 주소를 검색해 주세요.
          </p>
        )}
        <button
          type="submit"
          disabled={isAddressLocked}
          className={`w-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold py-3 px-4 rounded-xl transition ${
            isAddressLocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
          }`}
        >
          평판 등록
        </button>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-semibold text-navy-500 hover:text-navy-700 transition"
          >
            뒤로가기
          </button>
        )}
      </form>
    </div>
  )

  if (showOnlyForm) {
    return formContent
  }

  return (
    <div className="space-y-6">
      <div className="card-premium">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-accent-dark text-lg" />
          <h2 className="text-2xl font-bold text-navy-900">{report.address}</h2>
        </div>
      </div>

      {hasEvaluation ? (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GaugeChart
              label="네고 유연성"
              value={displayEvaluation!.negotiationFlexibility}
              description="협상 과정에서의 유연함"
            />
            <GaugeChart
              label="재계약 매너"
              value={displayEvaluation!.renewalManners}
              description="인상 폭 준수 및 갱신 시 태도"
            />
            <GaugeChart
              label="간섭 지수"
              value={displayEvaluation!.interferenceIndex}
              description="운영 중 방문 빈도 및 참견 정도"
            />
            <GaugeChart
              label="유지보수"
              value={displayEvaluation!.maintenanceCooperation}
              description="하자 수리 및 비용 부담에 대한 협조성"
            />
          </div>
        </div>
      ) : (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="text-center py-8">
            <FaMapMarkerAlt className="text-4xl text-blue-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-navy-900 mb-2">임대인 평가 정보 없음</h4>
            <p className="text-navy-600">해당 주소에 대한 임대인 평가가 아직 없어요.</p>
          </div>
        </div>
      )}

      {(report.userNotes || displayKeywordTags.length > 0) && (
        <div className="card">
          <h4 className="text-lg font-bold text-navy-900 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 rounded-full mr-2" />
            임대인 기록 정보
          </h4>
          <div className="flex flex-wrap gap-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            {displayKeywordTags.length > 0 ? (
              displayKeywordTags.map((tag) => {
                const isPositive = positiveKeywords.has(tag)
                const isNegative = negativeKeywords.has(tag)
                // 연한 색상으로 조정: 파랑(좋은), 빨강(나쁜)
                const toneClass = isNegative
                  ? 'text-red-600 border-red-100 bg-red-50'
                  : isPositive
                    ? 'text-blue-600 border-blue-100 bg-blue-50'
                    : 'text-slate-600 border-slate-200 bg-slate-50'
                return (
                  <span
                    key={tag}
                    className={`text-sm font-semibold rounded-full px-3 py-1 border ${toneClass}`}
                  >
                    #{tag.replace(/\s+/g, '')}
                  </span>
                )
              })
            ) : (
              <span className="text-sm text-blue-700">#정보없음</span>
            )}
          </div>
        </div>
      )}

      {/* 평판 제보하기 버튼 제거됨 */}

      {showInlineForm && (
        <div className="mt-6">
          {formContent}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-navy-900 flex items-center">
              <span className="w-1 h-6 bg-purple-500 rounded-full mr-2" />
              살아본 사람들이 말하는 이야기 ({reviews.length}개)
            </h4>
          </div>
          <p className="text-sm text-navy-500 mb-4">이 주소에 대한 경험을 공유해주세요.</p>
          <div className="space-y-4">
            {reviews.map((review) => {
              const isMine = !!myReviewIds[review.id]
              const isEditing = editingReviewId === review.id
              return (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-accent/30 transition"
                  style={{ overflowAnchor: 'none' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-900">{review.nickname}</div>
                        <div className="text-xs text-navy-500">{review.date}</div>
                      </div>
                    </div>
                    {isMine && (
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <>
                            <button
                              className="text-xs text-navy-700 hover:text-accent"
                              onClick={() => handleSaveReview(review.id)}
                            >
                              저장
                            </button>
                            <button
                              className="text-xs text-navy-500 hover:text-navy-700"
                              onClick={handleCancelEditReview}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                              <button
                                className="text-navy-700 hover:text-accent"
                                onClick={() => handleEditReview(review)}
                              >
                                수정
                              </button>
                              <span className="text-navy-300">|</span>
                              <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editingReviewText}
                      onChange={(e) => setEditingReviewText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none transition resize-none mb-2"
                    />
                  ) : (
                    <div className="text-navy-800 mb-2">{review.content}</div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      className={`flex items-center gap-1 text-xs ${
                        reviewVotes[review.id] === 'helpful'
                          ? 'text-accent'
                          : 'text-navy-500 hover:text-accent'
                      }`}
                      onClick={() => handleReviewVote(review.id, 'helpful')}
                      disabled={false}
                    >
                      <FaThumbsUp /> 도움돼요 {review.helpful}
                    </button>
                    <button
                      className={`flex items-center gap-1 text-xs ${
                        reviewVotes[review.id] === 'unhelpful'
                          ? 'text-accent'
                          : 'text-navy-500 hover:text-accent'
                      }`}
                      onClick={() => handleReviewVote(review.id, 'unhelpful')}
                      disabled={false}
                    >
                      <FaThumbsDown /> 별로예요 {review.unhelpful}
                    </button>
                    <button
                      className="flex items-center gap-1 text-xs text-navy-500 hover:text-accent"
                      onClick={() => handleToggleReviewComment(review.id)}
                    >
                      <FaComments /> 댓글 {(reviewComments[review.id] || []).length}
                    </button>
                  </div>

                  {openReviewCommentId === review.id && (
                    <div className="mt-3 space-y-3 min-h-[260px]" style={{ overflowAnchor: 'none' }}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-navy-500">
                          <span>댓글 입력</span>
                          <span>댓글 {((reviewComments[review.id] || []).length).toString()}개</span>
                        </div>
                        <input
                          type="text"
                          value={reviewCommentDrafts[review.id] || ''}
                          onChange={(e) => setReviewCommentDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="댓글을 입력하세요"
                          className="input-field py-2 text-sm"
                        />
                        <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            onClick={() => handleToggleReviewComment(review.id)}
                            className="text-navy-500 text-sm font-semibold hover:text-navy-700 transition whitespace-nowrap"
                          >
                            댓글 접기
                          </button>
                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <label className="flex items-center gap-2 text-xs text-navy-500">
                              <input
                                type="checkbox"
                                checked={!!reviewCommentSecretDrafts[review.id]}
                                onChange={(e) =>
                                  setReviewCommentSecretDrafts((prev) => ({ ...prev, [review.id]: e.target.checked }))
                                }
                              />
                              비밀 댓글
                            </label>
                            <button
                              type="button"
                              onClick={() => handleSubmitReviewComment(review.id)}
                              className="px-4 py-2 bg-navy-600 text-white rounded-lg text-sm font-semibold hover:bg-navy-700 transition whitespace-nowrap"
                            >
                              등록
                            </button>
                            <button
                              onClick={() => handleCancelReviewCommentInput(review.id)}
                              className="px-4 py-2 border border-gray-200 text-navy-600 rounded-lg text-sm font-semibold hover:border-navy-300 transition whitespace-nowrap"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="h-48 overflow-y-auto pr-1">
                        {(reviewComments[review.id] || []).map((comment) => {
                          if (comment.isSecret && !(comment.isMine || isMine)) {
                            return null
                          }
                          const isEditing = editingCommentIds[review.id] === comment.id
                          return (
                            <div
                              key={`${review.id}-comment-${comment.id}`}
                              className="text-sm text-navy-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                            >
                              {isEditing ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editingCommentDrafts[comment.id] || ''}
                                    onChange={(e) =>
                                      setEditingCommentDrafts((prev) => ({
                                        ...prev,
                                        [comment.id]: e.target.value,
                                      }))
                                    }
                                    className="input-field py-1 text-xs"
                                  />
                                  <button
                                    onClick={() => handleSaveReviewComment(review.id, comment.id)}
                                    className="text-xs text-navy-700 hover:text-accent"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => handleCancelEditReviewComment(review.id, comment.id)}
                                    className="text-xs text-navy-500 hover:text-navy-700"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] text-navy-500 mb-1">
                                      {comment.isSecret && <span className="mr-1 text-amber-600">(비밀)</span>}
                                      {comment.author}
                                      <span className="ml-1">· {comment.timestamp}</span>
                                    </div>
                                    <span>{comment.text}</span>
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                      <button
                                        onClick={() => handleToggleReviewReply(comment.id)}
                                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 font-semibold text-navy-500 hover:text-navy-700 hover:border-navy-300 transition"
                                      >
                                        답글
                                      </button>
                                    </div>
                                    {reviewReplyOpenIds[comment.id] && (
                                      <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2 space-y-2">
                                        <input
                                          type="text"
                                          value={reviewReplyDrafts[comment.id] || ''}
                                          onChange={(e) =>
                                            setReviewReplyDrafts((prev) => ({
                                              ...prev,
                                              [comment.id]: e.target.value,
                                            }))
                                          }
                                          placeholder="답글 입력"
                                          className="input-field py-2 text-sm bg-white w-full"
                                        />
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <label className="flex items-center gap-2 text-xs text-navy-500">
                                            <input
                                              type="checkbox"
                                              checked={!!reviewReplySecretDrafts[comment.id]}
                                              onChange={(e) =>
                                                setReviewReplySecretDrafts((prev) => ({
                                                  ...prev,
                                                  [comment.id]: e.target.checked,
                                                }))
                                              }
                                            />
                                            비밀 답글
                                          </label>
                                          <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => handleSubmitReviewReply(review.id, comment.id)}
                                            className="px-3 py-1.5 bg-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition whitespace-nowrap"
                                          >
                                            등록
                                          </button>
                                          <button
                                            onClick={() => handleCancelReviewReply(comment.id)}
                                            className="px-3 py-1.5 border border-gray-200 text-navy-600 rounded-lg text-xs font-semibold hover:border-navy-300 transition whitespace-nowrap"
                                          >
                                            취소
                                          </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {(comment.replies || []).length > 0 && (
                                      <div className="mt-2">
                                        <button
                                          onClick={() => handleToggleReviewReplyList(comment.id)}
                                          className="text-xs font-semibold text-navy-500 hover:text-accent"
                                        >
                                          {reviewReplyVisibleIds[comment.id]
                                            ? '답글 숨기기'
                                            : `답글 보기 ${comment.replies?.length || 0}`}
                                        </button>
                                        {reviewReplyVisibleIds[comment.id] &&
                                          renderReviewReplies(comment.replies || [], review.id, comment.id, isMine)}
                                      </div>
                                    )}
                                  </div>
                                  {comment.isMine && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditReviewComment(review.id, comment)}
                                        className="text-xs text-navy-500 hover:text-accent"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReviewComment(review.id, comment.id)}
                                        className="text-xs text-red-500 hover:underline"
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
                        }
                        {(reviewComments[review.id] || []).length === 0 && (
                          <div className="text-xs text-navy-500 opacity-0 select-none">아직 댓글이 없습니다.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {onGoHome && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onGoHome}
                className="text-sm font-semibold text-navy-500 hover:text-navy-700 transition"
              >
                홈으로 가기
              </button>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="card text-center">
          <div className="py-8">
            <FaComments className="text-4xl text-gray-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-navy-900 mb-2">아직 등록된 이야기가 없습니다</h4>
            <p className="text-navy-600">이 주소에 대한 경험을 공유해주세요.</p>
          </div>
          <div className="flex flex-col items-center gap-2 pb-6">
            {onWriteReputation && (
              <button
                onClick={onWriteReputation}
                className="w-full bg-gradient-to-r from-accent to-accent-dark hover:shadow-lg text-white font-bold py-3 px-4 rounded-xl transition"
              >
                평판 제보하기
              </button>
            )}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full bg-navy-100 text-navy-700 font-bold py-2 px-4 rounded-xl hover:bg-navy-200 transition"
              >
                홈으로 가기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
