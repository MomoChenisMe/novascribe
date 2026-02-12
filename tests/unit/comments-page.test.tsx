/**
 * @file 評論管理頁面測試
 * @description 測試評論管理頁面（Server Component）
 *   - 未認證時重導向
 *   - 載入評論列表
 *   - 狀態篩選 tabs
 *   - 統計卡片
 *   - 評論列表表格
 *   - 分頁控制
 * @jest-environment node
 */

// Mock dependencies FIRST
jest.mock('next-auth');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CommentsPage from '@/app/(admin)/admin/comments/page';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Mock 評論資料 */
const mockComments = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorName: '張三',
    authorEmail: 'zhang@test.com',
    content: '這是一篇很棒的文章，感謝分享！期待後續更新。',
    status: 'PENDING',
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-02-10T10:00:00.000Z',
    post: {
      id: 'post-1',
      title: '如何使用 Next.js 建構現代化網站',
      slug: 'nextjs-modern-website',
    },
  },
  {
    id: 'comment-2',
    postId: 'post-2',
    authorName: '李四',
    authorEmail: 'li@test.com',
    content: '非常實用的教學！已經成功部署到 Vercel 了。謝謝作者！',
    status: 'APPROVED',
    createdAt: '2024-02-09T14:30:00.000Z',
    updatedAt: '2024-02-09T14:30:00.000Z',
    post: {
      id: 'post-2',
      title: 'TypeScript 完整指南',
      slug: 'typescript-complete-guide',
    },
  },
];

const mockStats = {
  pending: 5,
  todayNew: 3,
  approved: 120,
  spam: 8,
};

const mockPaginationMeta = {
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

/** 設定 fetch 回傳 */
function setupFetchResponses() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/admin/comments/stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });
    }
    if (url.includes('/api/admin/comments')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            comments: mockComments,
            total: mockPaginationMeta.total,
            page: mockPaginationMeta.page,
            limit: mockPaginationMeta.limit,
            totalPages: mockPaginationMeta.totalPages,
          }),
      });
    }
    return Promise.reject(new Error('Not found'));
  });
}

describe('評論管理頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
  });

  describe('認證檢查', () => {
    it('未認證時應重導向到登入頁', async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(async () => {
        await CommentsPage({ searchParams: {} });
      }).rejects.toThrow('REDIRECT:/api/auth/signin');

      expect(mockRedirect).toHaveBeenCalledWith('/api/auth/signin');
    });

    it('已認證時應正常載入頁面', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
      } as any);
      setupFetchResponses();

      const result = await CommentsPage({ searchParams: {} });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('資料載入', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
      } as any);
    });

    it('應載入統計資料', async () => {
      setupFetchResponses();

      await CommentsPage({ searchParams: {} });

      // 驗證有呼叫 stats API
      const statsCalls = mockFetch.mock.calls.filter((call: any) =>
        call[0].includes('/api/admin/comments/stats')
      );
      expect(statsCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('應載入評論列表', async () => {
      setupFetchResponses();

      await CommentsPage({ searchParams: {} });

      // 驗證有呼叫 comments API
      const commentsCalls = mockFetch.mock.calls.filter((call: any) =>
        call[0].includes('/api/admin/comments') &&
        !call[0].includes('/stats')
      );
      expect(commentsCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('應使用預設分頁參數（page=1, limit=20）', async () => {
      setupFetchResponses();

      await CommentsPage({ searchParams: {} });

      const commentsCalls = mockFetch.mock.calls.filter((call: any) =>
        call[0].includes('/api/admin/comments') &&
        !call[0].includes('/stats')
      );
      const url = new URL(commentsCalls[0][0], 'http://localhost');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('limit')).toBe('20');
    });

    it('應根據 searchParams 傳遞狀態篩選', async () => {
      setupFetchResponses();

      await CommentsPage({ searchParams: { status: 'PENDING' } });

      const commentsCalls = mockFetch.mock.calls.filter((call: any) =>
        call[0].includes('/api/admin/comments') &&
        !call[0].includes('/stats')
      );
      const url = new URL(commentsCalls[0][0], 'http://localhost');
      expect(url.searchParams.get('status')).toBe('PENDING');
    });

    it('應根據 searchParams 傳遞分頁參數', async () => {
      setupFetchResponses();

      await CommentsPage({ searchParams: { page: '2', limit: '50' } });

      const commentsCalls = mockFetch.mock.calls.filter((call: any) =>
        call[0].includes('/api/admin/comments') &&
        !call[0].includes('/stats')
      );
      const url = new URL(commentsCalls[0][0], 'http://localhost');
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.get('limit')).toBe('50');
    });
  });

  describe('API 錯誤處理', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
      } as any);
    });

    it('stats API 錯誤應使用預設統計值', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/admin/comments/stats')) {
          return Promise.reject(new Error('Stats API error'));
        }
        if (url.includes('/api/admin/comments')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                comments: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
              }),
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      const result = await CommentsPage({ searchParams: {} });

      expect(result).toBeDefined();
      // 頁面應該仍然渲染（使用預設統計值）
    });

    it('comments API 錯誤應使用空列表', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/admin/comments/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStats),
          });
        }
        if (url.includes('/api/admin/comments')) {
          return Promise.reject(new Error('Comments API error'));
        }
        return Promise.reject(new Error('Not found'));
      });

      const result = await CommentsPage({ searchParams: {} });

      expect(result).toBeDefined();
      // 頁面應該仍然渲染（使用空列表）
    });
  });
});
