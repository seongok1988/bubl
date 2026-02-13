// ============================================================
// DB 테이블 타입 정의 (types/db.ts)
// 모든 Supabase 테이블 관련 타입을 이 파일에서 관리합니다.
// 컴포넌트/서비스에서는 이 파일에서 import하여 사용합니다.
// ============================================================

// ---- landlord_reports 테이블 ----

export interface LandlordEvaluation {
  negotiationFlexibility: number;
  renewalManners: number;
  interferenceIndex: number;
  maintenanceCooperation: number;
}

export interface EvaluationScore {
  negotiationFlexibility: number;
  renewalManners: number;
  interferenceIndex: number;
  maintenanceCooperation: number;
}

export interface KeywordSelection {
  keywords: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  user_id?: string;
  date: string;
  helpful: number;
  unhelpful: number;
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
  author_id?: string;
}

/** Supabase insert용 타입 (DB 컬럼과 1:1 매핑) */
export interface LandlordReportInsert {
  id?: string;
  address: string;
  author_id: string;
  landlordName?: string;
  rating?: number;
  totalReviews?: number;
  recommendations?: number;
  warnings?: number;
  evaluation?: LandlordEvaluation;
  reviews?: Review[];
  positive_traits?: string[];
  negative_traits?: string[];
  positiveTraits?: string[];
  negativeTraits?: string[];
  userNotes?: string;
}

// ---- comments 테이블 ----

export interface CommentRow {
  id: string;
  post_id?: string;
  report_id?: string;
  user_id: string;
  author_id?: string;
  content: string;
  is_secret: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ReviewComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isSecret: boolean;
  isMine: boolean;
  replies: ReviewComment[];
}

export interface ReviewReply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isSecret: boolean;
  isMine: boolean;
  replies: ReviewReply[];
}

// ---- communities 테이블 ----

export interface Community {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// ---- posts 테이블 ----

export interface Post {
  id: string;
  community_id: string;
  title: string;
  content: string;
  author?: string;
  category?: string;
  user_id?: string;
  created_at: string;
}

// ---- surveys 관련 테이블 ----

export interface Survey {
  id: string;
  community_id: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question: string;
}

export interface SurveyAnswer {
  id: string;
  survey_id: string;
  question_id: string;
  user_id: string;
  answer: string;
}

// ---- 컴포넌트 Props 타입 ----

export interface LandlordReportProps {
  report: LandlordReport | null;
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

export interface ReputationSubmitSummary {
  address: string;
  averageEvaluation: LandlordEvaluation | null;
  topKeywords: string[];
}

// ---- votes (in-memory, CommunitySection 용) ----

export type VotesState = { [postId: string]: { up: number; down: number } };

// ============================================================
// 신규 평판/신고/커뮤니티 시스템 타입
// ============================================================

// ---- reputation_surveys 테이블 ----
export type SurveyStatus = 'active' | 'blind' | 'deleted';

export interface ReputationSurvey {
  id: string;
  user_id: string;
  address: string;
  landlord_name?: string;
  rating?: number;
  review_content: string;
  evaluation?: LandlordEvaluation;
  keywords?: string[];
  status: SurveyStatus;
  legal_agreement: boolean;
  created_at: string;
  updated_at: string;
  // joined
  user_profiles?: UserProfile;
}

// ---- reputation_evaluation_scores 테이블 ----
export interface ReputationEvaluationScore {
  id: string;
  survey_id: string;
  negotiation_flexibility: number;
  renewal_manners: number;
  interference_index: number;
  maintenance_cooperation: number;
  created_at: string;
}

// ---- review_reports 테이블 ----
export type ReportReason = 'defamation' | 'privacy' | 'profanity' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'deleted';

export interface ReviewReport {
  id: string;
  reporter_id: string;
  target_survey_id?: string;
  target_review_id?: string;
  reason: ReportReason;
  detail?: string;
  attachment_url?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  // joined
  user_profiles?: UserProfile;
  reputation_surveys?: ReputationSurvey;
}

// ---- community_posts 테이블 ----
export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: '경험담' | '질문' | '주의사항';
  status: 'active' | 'blind' | 'deleted';
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  // joined
  user_profiles?: UserProfile;
  comment_count?: number;
}

// ---- community_comments 테이블 ----
export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  is_secret: boolean;
  status: 'active' | 'deleted';
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  // joined
  user_profiles?: UserProfile;
  children?: CommunityComment[];
}

// ---- community_reports 테이블 ----
export interface CommunityReport {
  id: string;
  reporter_id: string;
  post_id: string;
  reason: ReportReason;
  detail?: string;
  attachment_url?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

// ---- notifications 테이블 ----
export type NotificationType = 'comment' | 'report' | 'admin' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// ---- admin_logs 테이블 ----
export type AdminAction = 'blind' | 'unblind' | 'delete' | 'edit' | 'dismiss';

export interface AdminLog {
  id: string;
  admin_id: string;
  action: AdminAction;
  target_type: 'survey' | 'post' | 'comment' | 'report';
  target_id: string;
  reason?: string;
  created_at: string;
}

// ---- legal_logs 테이블 ----
export interface LegalLog {
  id: string;
  user_id: string;
  survey_id?: string;
  agreed: boolean;
  disclaimer_text: string;
  ip_address?: string;
  created_at: string;
}

// ---- community_votes 테이블 ----
export interface CommunityVote {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

// ---- user_profiles 테이블 ----
export interface UserProfile {
  id: string;
  nickname?: string;
  status: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
}

// ---- 법적 면책 동의 문구 상수 ----
export const LEGAL_DISCLAIMER_TEXT = `본 설문 제보의 모든 내용은 작성자 본인의 책임 하에 작성된 것입니다.
운영자는 「정보통신망법」 및 「개인정보 보호법」 등 관련 법령에 따라 신고가 접수될 경우 해당 게시물이 최대 30일간 임시로 비공개 처리될 수 있으며, 명예훼손·허위사실 유포·욕설·비하 등 불법적 또는 부적절한 내용이 확인될 경우 게시물은 삭제될 수 있습니다.
작성자는 본 설문 제보가 법적 분쟁의 대상이 될 수 있음을 인지하고, 이에 따른 모든 법적 책임은 작성자 본인에게 있음을 동의합니다.`;

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'defamation', label: '명예훼손' },
  { value: 'privacy', label: '개인정보 노출' },
  { value: 'profanity', label: '욕설/비하' },
  { value: 'other', label: '기타' },
];
