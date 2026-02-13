import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing module
const mockSelect = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
}));

const mockGetUser = vi.fn();

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe('lib/api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCommunities', () => {
    it('커뮤니티 목록을 최신순으로 조회한다', async () => {
      const mockData = [
        { id: '1', name: 'Test', description: 'Desc', created_at: '2025-01-01' },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { fetchCommunities } = await import('@/lib/api/community');
      const result = await fetchCommunities();

      expect(mockFrom).toHaveBeenCalledWith('communities');
      expect(result).toEqual(mockData);
    });

    it('에러 발생 시 throw한다', async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: 'DB error' },
      });

      const { fetchCommunities } = await import('@/lib/api/community');
      await expect(fetchCommunities()).rejects.toEqual({ message: 'DB error' });
    });
  });

  describe('createCommunity', () => {
    it('새 커뮤니티를 생성한다', async () => {
      const newCommunity = { id: '1', name: 'New', description: 'Desc' };
      mockSelect.mockResolvedValueOnce({ data: [newCommunity], error: null });

      const { createCommunity } = await import('@/lib/api/community');
      const result = await createCommunity({ name: 'New', description: 'Desc' });

      expect(mockFrom).toHaveBeenCalledWith('communities');
      expect(result).toEqual(newCommunity);
    });
  });

  describe('fetchCommunityById', () => {
    it('ID로 커뮤니티를 조회한다', async () => {
      const community = { id: '1', name: 'Test', description: 'Desc' };
      mockSingle.mockResolvedValueOnce({ data: community, error: null });

      const { fetchCommunityById } = await import('@/lib/api/community');
      const result = await fetchCommunityById('1');

      expect(mockFrom).toHaveBeenCalledWith('communities');
      expect(result).toEqual(community);
    });
  });
});
