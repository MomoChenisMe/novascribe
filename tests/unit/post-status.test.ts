/**
 * @file 文章狀態切換測試
 * @description 測試所有有效/無效狀態轉換、發佈時間設定、排程驗證
 *   - 有效轉換：DRAFT→PUBLISHED, DRAFT→SCHEDULED, DRAFT→ARCHIVED, etc.
 *   - 無效轉換：PUBLISHED→SCHEDULED, ARCHIVED→PUBLISHED, etc.
 *   - PUBLISHED 時自動設定 publishedAt
 *   - SCHEDULED 需要 scheduledAt 且必須在未來
 *   - 取消發佈時清除 publishedAt
 */

import { updatePostStatus } from '@/services/post.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock 文章 */
function mockPost(
  overrides: Partial<{
    id: string;
    status: string;
    publishedAt: Date | null;
    scheduledAt: Date | null;
  }> = {}
) {
  return {
    id: 'post-1',
    title: '測試文章',
    slug: 'test-post',
    content: '# 測試內容',
    excerpt: null,
    coverImage: null,
    status: 'DRAFT',
    publishedAt: null,
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== 有效狀態轉換 =====
describe('有效狀態轉換', () => {
  it('DRAFT → PUBLISHED', async () => {
    const post = mockPost({ status: 'DRAFT' });
    const updated = mockPost({ status: 'PUBLISHED', publishedAt: new Date() });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'PUBLISHED' as any);

    expect(result.status).toBe('PUBLISHED');
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: expect.objectContaining({
        status: 'PUBLISHED',
        publishedAt: expect.any(Date),
      }),
    });
  });

  it('DRAFT → SCHEDULED（含 scheduledAt）', async () => {
    const post = mockPost({ status: 'DRAFT' });
    const futureDate = new Date(Date.now() + 86400000); // 明天
    const updated = mockPost({ status: 'SCHEDULED', scheduledAt: futureDate });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'SCHEDULED' as any, futureDate);

    expect(result.status).toBe('SCHEDULED');
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: expect.objectContaining({
        status: 'SCHEDULED',
        scheduledAt: futureDate,
      }),
    });
  });

  it('DRAFT → ARCHIVED', async () => {
    const post = mockPost({ status: 'DRAFT' });
    const updated = mockPost({ status: 'ARCHIVED' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'ARCHIVED' as any);
    expect(result.status).toBe('ARCHIVED');
  });

  it('PUBLISHED → ARCHIVED', async () => {
    const post = mockPost({ status: 'PUBLISHED', publishedAt: new Date() });
    const updated = mockPost({ status: 'ARCHIVED' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'ARCHIVED' as any);
    expect(result.status).toBe('ARCHIVED');
  });

  it('PUBLISHED → DRAFT（取消發佈）', async () => {
    const post = mockPost({ status: 'PUBLISHED', publishedAt: new Date() });
    const updated = mockPost({ status: 'DRAFT', publishedAt: null });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'DRAFT' as any);

    expect(result.status).toBe('DRAFT');
    // 取消發佈時應清除 publishedAt
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: expect.objectContaining({
        status: 'DRAFT',
        publishedAt: null,
      }),
    });
  });

  it('SCHEDULED → DRAFT', async () => {
    const post = mockPost({ status: 'SCHEDULED' });
    const updated = mockPost({ status: 'DRAFT' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'DRAFT' as any);
    expect(result.status).toBe('DRAFT');
  });

  it('SCHEDULED → PUBLISHED', async () => {
    const post = mockPost({ status: 'SCHEDULED' });
    const updated = mockPost({ status: 'PUBLISHED', publishedAt: new Date() });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'PUBLISHED' as any);
    expect(result.status).toBe('PUBLISHED');
  });

  it('SCHEDULED → ARCHIVED', async () => {
    const post = mockPost({ status: 'SCHEDULED' });
    const updated = mockPost({ status: 'ARCHIVED' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'ARCHIVED' as any);
    expect(result.status).toBe('ARCHIVED');
  });

  it('ARCHIVED → DRAFT（重新啟用）', async () => {
    const post = mockPost({ status: 'ARCHIVED' });
    const updated = mockPost({ status: 'DRAFT' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(updated);

    const result = await updatePostStatus('post-1', 'DRAFT' as any);
    expect(result.status).toBe('DRAFT');
  });
});

// ===== 無效狀態轉換 =====
describe('無效狀態轉換', () => {
  it('PUBLISHED → SCHEDULED 應拋出錯誤', async () => {
    const post = mockPost({ status: 'PUBLISHED' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'SCHEDULED' as any)
    ).rejects.toThrow('Invalid status transition: PUBLISHED → SCHEDULED');
  });

  it('ARCHIVED → PUBLISHED 應拋出錯誤', async () => {
    const post = mockPost({ status: 'ARCHIVED' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'PUBLISHED' as any)
    ).rejects.toThrow('Invalid status transition: ARCHIVED → PUBLISHED');
  });

  it('ARCHIVED → SCHEDULED 應拋出錯誤', async () => {
    const post = mockPost({ status: 'ARCHIVED' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'SCHEDULED' as any)
    ).rejects.toThrow('Invalid status transition: ARCHIVED → SCHEDULED');
  });

  it('ARCHIVED → ARCHIVED 應拋出錯誤（同狀態）', async () => {
    const post = mockPost({ status: 'ARCHIVED' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'ARCHIVED' as any)
    ).rejects.toThrow('Invalid status transition: ARCHIVED → ARCHIVED');
  });

  it('DRAFT → DRAFT 應拋出錯誤（同狀態）', async () => {
    const post = mockPost({ status: 'DRAFT' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'DRAFT' as any)
    ).rejects.toThrow('Invalid status transition: DRAFT → DRAFT');
  });
});

// ===== PUBLISHED 時自動設定 publishedAt =====
describe('publishedAt 設定', () => {
  it('PUBLISHED 且無 publishedAt 時應自動設定', async () => {
    const post = mockPost({ status: 'DRAFT', publishedAt: null });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue({
      ...post,
      status: 'PUBLISHED',
    });

    await updatePostStatus('post-1', 'PUBLISHED' as any);

    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: expect.objectContaining({
        publishedAt: expect.any(Date),
      }),
    });
  });

  it('已有 publishedAt 時不應覆蓋（重新發佈的情況）', async () => {
    const existingDate = new Date('2024-01-01');
    const post = mockPost({
      status: 'SCHEDULED',
      publishedAt: existingDate,
    });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue({
      ...post,
      status: 'PUBLISHED',
    });

    await updatePostStatus('post-1', 'PUBLISHED' as any);

    // 不應包含 publishedAt（因為已有值）
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { status: 'PUBLISHED' },
    });
  });
});

// ===== SCHEDULED 驗證 =====
describe('SCHEDULED 驗證', () => {
  it('SCHEDULED 缺少 scheduledAt 應拋出錯誤', async () => {
    const post = mockPost({ status: 'DRAFT' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'SCHEDULED' as any)
    ).rejects.toThrow('scheduledAt is required for SCHEDULED status');
  });

  it('SCHEDULED 的 scheduledAt 在過去應拋出錯誤', async () => {
    const post = mockPost({ status: 'DRAFT' });
    const pastDate = new Date('2020-01-01');
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    await expect(
      updatePostStatus('post-1', 'SCHEDULED' as any, pastDate)
    ).rejects.toThrow('scheduledAt must be in the future');
  });
});

// ===== 文章不存在 =====
describe('文章不存在', () => {
  it('應拋出錯誤', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updatePostStatus('nonexistent', 'PUBLISHED' as any)
    ).rejects.toThrow('Post "nonexistent" not found');
  });
});
