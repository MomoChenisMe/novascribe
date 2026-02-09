/**
 * @file 排程發佈 Cron Job 測試
 * @description 測試 /api/cron/publish-scheduled route handler
 *   - 認證：CRON_SECRET 驗證
 *   - 查詢到期文章：status=SCHEDULED AND scheduledAt <= NOW()
 *   - 批次更新狀態：status=PUBLISHED, publishedAt=NOW()
 *   - 無到期文章時回傳 published: 0
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/cron/publish-scheduled/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立帶有 Authorization header 的 mock Request */
function createCronRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader) {
    headers['authorization'] = authHeader;
  }
  return new Request('http://localhost:3000/api/cron/publish-scheduled', {
    method: 'GET',
    headers,
  });
}

/** 建立 mock 排程文章 */
function mockScheduledPost(overrides: Partial<{
  id: string;
  title: string;
  status: string;
  scheduledAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? 'post-1',
    title: overrides.title ?? '排程文章',
    status: overrides.status ?? 'SCHEDULED',
    scheduledAt: overrides.scheduledAt ?? new Date('2026-01-01T00:00:00Z'),
    slug: 'test-post',
    content: 'test content',
    excerpt: null,
    coverImage: null,
    publishedAt: null,
    authorId: 'author-1',
    categoryId: null,
    createdAt: new Date('2025-12-01T00:00:00Z'),
    updatedAt: new Date('2025-12-01T00:00:00Z'),
  };
}

describe('/api/cron/publish-scheduled', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, CRON_SECRET: 'test-cron-secret' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('認證', () => {
    test('缺少 Authorization header 應回傳 401', async () => {
      const request = createCronRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    test('Authorization header 格式錯誤應回傳 401', async () => {
      const request = createCronRequest('InvalidToken');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    test('Bearer token 不匹配應回傳 401', async () => {
      const request = createCronRequest('Bearer wrong-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    test('CRON_SECRET 未設定應回傳 401', async () => {
      delete process.env.CRON_SECRET;

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    test('正確的 Bearer token 應通過認證', async () => {
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('查詢到期文章', () => {
    test('應查詢 status=SCHEDULED 且 scheduledAt <= NOW() 的文章', async () => {
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);

      const request = createCronRequest('Bearer test-cron-secret');
      const beforeCall = new Date();
      await GET(request);
      const afterCall = new Date();

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: expect.any(Date),
          },
        },
      });

      // 驗證傳入的時間在合理範圍內
      const calledWith = (mockPrisma.post.findMany as jest.Mock).mock.calls[0][0];
      const queriedDate = calledWith.where.scheduledAt.lte as Date;
      expect(queriedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(queriedDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('批次更新', () => {
    test('有到期文章時應批次更新狀態為 PUBLISHED', async () => {
      const posts = [
        mockScheduledPost({ id: 'post-1' }),
        mockScheduledPost({ id: 'post-2' }),
        mockScheduledPost({ id: 'post-3' }),
      ];

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);
      (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.published).toBe(3);

      expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['post-1', 'post-2', 'post-3'] },
        },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        },
      });
    });

    test('無到期文章時應回傳 published: 0', async () => {
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.published).toBe(0);
      expect(mockPrisma.post.updateMany).not.toHaveBeenCalled();
    });

    test('單篇到期文章應正確處理', async () => {
      const posts = [mockScheduledPost({ id: 'single-post' })];

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);
      (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.published).toBe(1);
      expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['single-post'] },
        },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        },
      });
    });
  });

  describe('錯誤處理', () => {
    test('Prisma 查詢失敗時應回傳 500', async () => {
      (mockPrisma.post.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    test('Prisma 更新失敗時應回傳 500', async () => {
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
        mockScheduledPost(),
      ]);
      (mockPrisma.post.updateMany as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const request = createCronRequest('Bearer test-cron-secret');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });
});
