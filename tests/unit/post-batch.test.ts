/**
 * @file 文章批次操作測試
 * @description 測試批次刪除、批次發佈、批次下架、數量上限
 *   - batchDeletePosts：批次刪除文章
 *   - batchPublishPosts：批次發佈文章
 *   - batchArchivePosts：批次下架文章
 *   - 數量上限：超過 100 筆應拋出錯誤
 *   - 空陣列：應回傳 0
 */

import {
  batchDeletePosts,
  batchPublishPosts,
  batchArchivePosts,
} from '@/services/post.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== batchDeletePosts =====
describe('batchDeletePosts', () => {
  it('應成功批次刪除文章', async () => {
    (mockPrisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

    const result = await batchDeletePosts(['post-1', 'post-2', 'post-3']);

    expect(result).toBe(3);
    expect(mockPrisma.post.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['post-1', 'post-2', 'post-3'] } },
    });
  });

  it('空陣列應回傳 0', async () => {
    const result = await batchDeletePosts([]);

    expect(result).toBe(0);
    expect(mockPrisma.post.deleteMany).not.toHaveBeenCalled();
  });

  it('超過 100 筆應拋出錯誤', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => `post-${i}`);

    await expect(batchDeletePosts(ids)).rejects.toThrow(
      'Batch operation limited to 100 items'
    );
  });

  it('100 筆剛好應成功', async () => {
    const ids = Array.from({ length: 100 }, (_, i) => `post-${i}`);
    (mockPrisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });

    const result = await batchDeletePosts(ids);
    expect(result).toBe(100);
  });
});

// ===== batchPublishPosts =====
describe('batchPublishPosts', () => {
  it('應成功批次發佈文章', async () => {
    (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    const result = await batchPublishPosts(['post-1', 'post-2']);

    expect(result).toBe(2);
    expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['post-1', 'post-2'] },
        status: { in: ['DRAFT', 'SCHEDULED'] },
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
      },
    });
  });

  it('空陣列應回傳 0', async () => {
    const result = await batchPublishPosts([]);

    expect(result).toBe(0);
    expect(mockPrisma.post.updateMany).not.toHaveBeenCalled();
  });

  it('超過 100 筆應拋出錯誤', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => `post-${i}`);

    await expect(batchPublishPosts(ids)).rejects.toThrow(
      'Batch operation limited to 100 items'
    );
  });

  it('應只更新 DRAFT 和 SCHEDULED 狀態的文章', async () => {
    (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await batchPublishPosts(['post-1']);

    expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        status: { in: ['DRAFT', 'SCHEDULED'] },
      }),
      data: expect.any(Object),
    });
  });
});

// ===== batchArchivePosts =====
describe('batchArchivePosts', () => {
  it('應成功批次下架文章', async () => {
    (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    const result = await batchArchivePosts(['post-1', 'post-2']);

    expect(result).toBe(2);
    expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['post-1', 'post-2'] },
        status: { in: ['DRAFT', 'PUBLISHED', 'SCHEDULED'] },
      },
      data: {
        status: 'ARCHIVED',
      },
    });
  });

  it('空陣列應回傳 0', async () => {
    const result = await batchArchivePosts([]);

    expect(result).toBe(0);
    expect(mockPrisma.post.updateMany).not.toHaveBeenCalled();
  });

  it('超過 100 筆應拋出錯誤', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => `post-${i}`);

    await expect(batchArchivePosts(ids)).rejects.toThrow(
      'Batch operation limited to 100 items'
    );
  });

  it('應只更新非 ARCHIVED 狀態的文章', async () => {
    (mockPrisma.post.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await batchArchivePosts(['post-1']);

    expect(mockPrisma.post.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        status: { in: ['DRAFT', 'PUBLISHED', 'SCHEDULED'] },
      }),
      data: expect.any(Object),
    });
  });
});
