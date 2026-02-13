import { describe, it, expect } from 'vitest';
import type {
  LandlordReport,
  LandlordEvaluation,
  CommentRow,
  Community,
  Post,
  Survey,
} from '@/types/db';

describe('types/db', () => {
  it('LandlordReport 타입이 올바른 구조를 가진다', () => {
    const report: LandlordReport = {
      address: '서울시 강남구',
      landlordName: '홍길동',
      rating: 4.5,
      totalReviews: 10,
      positiveTraits: ['친절', '빠른대응'],
      negativeTraits: [],
      recommendations: 8,
      warnings: 2,
    };
    expect(report.address).toBe('서울시 강남구');
    expect(report.rating).toBe(4.5);
  });

  it('CommentRow 타입이 올바른 구조를 가진다', () => {
    const comment: CommentRow = {
      id: '1',
      user_id: 'user-1',
      content: '테스트 댓글',
      is_secret: false,
      created_at: '2025-01-01T00:00:00Z',
    };
    expect(comment.content).toBe('테스트 댓글');
    expect(comment.is_secret).toBe(false);
  });

  it('Community 타입이 올바른 구조를 가진다', () => {
    const community: Community = {
      id: '1',
      name: '강남 주민',
      description: '강남구 임대인 정보',
      created_at: '2025-01-01T00:00:00Z',
    };
    expect(community.name).toBe('강남 주민');
  });

  it('Post 타입이 올바른 구조를 가진다', () => {
    const post: Post = {
      id: '1',
      community_id: 'comm-1',
      title: '테스트 게시글',
      content: '본문 내용',
      created_at: '2025-01-01T00:00:00Z',
    };
    expect(post.title).toBe('테스트 게시글');
  });

  it('LandlordEvaluation 타입이 올바른 구조를 가진다', () => {
    const evaluation: LandlordEvaluation = {
      negotiationFlexibility: 4,
      renewalManners: 3,
      interferenceIndex: 2,
      maintenanceCooperation: 5,
    };
    expect(evaluation.maintenanceCooperation).toBe(5);
  });
});
