/**
 * @file 儀表板 Service 層測試
 * @description 測試儀表板統計數據查詢與近期活動查詢
 *   - getDashboardStats：文章總數、各狀態數量、分類/標籤/媒體總數、近 7 天新增文章數
 *   - getRecentActivity：查詢近期活動（文章建立/更新/發佈、分類/標籤建立、媒體上傳）
 */

import { getDashboardStats, getRecentActivity } from '@/services/dashboard.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    tag: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    media: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getDashboardStats ──────────────────────────────────────────────

describe('getDashboardStats', () => {
  it('應回傳完整的統計數據', async () => {
    (mockPrisma.post.count as jest.Mock)
      .mockResolvedValueOnce(25)   // totalPosts
      .mockResolvedValueOnce(15)   // publishedPosts
      .mockResolvedValueOnce(5)    // draftPosts
      .mockResolvedValueOnce(3)    // scheduledPosts
      .mockResolvedValueOnce(4);   // recentPostsCount
    (mockPrisma.category.count as jest.Mock).mockResolvedValue(8);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(12);
    (mockPrisma.media.count as jest.Mock).mockResolvedValue(30);

    const stats = await getDashboardStats();

    expect(stats).toEqual({
      totalPosts: 25,
      publishedPosts: 15,
      draftPosts: 5,
      scheduledPosts: 3,
      totalCategories: 8,
      totalTags: 12,
      totalMedia: 30,
      recentPostsCount: 4,
    });
  });

  it('應使用 prisma.count() 而非 findMany', async () => {
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.category.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats();

    expect(mockPrisma.post.count).toHaveBeenCalledTimes(5);
    expect(mockPrisma.category.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.tag.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.media.count).toHaveBeenCalledTimes(1);

    // 不應呼叫 findMany
    expect(mockPrisma.post.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.tag.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.media.findMany).not.toHaveBeenCalled();
  });

  it('應使用正確的 where 條件查詢各狀態文章', async () => {
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.category.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

    await getDashboardStats();

    // 第 1 次：totalPosts（無條件）
    expect(mockPrisma.post.count).toHaveBeenNthCalledWith(1);
    // 第 2 次：publishedPosts
    expect(mockPrisma.post.count).toHaveBeenNthCalledWith(2, {
      where: { status: 'PUBLISHED' },
    });
    // 第 3 次：draftPosts
    expect(mockPrisma.post.count).toHaveBeenNthCalledWith(3, {
      where: { status: 'DRAFT' },
    });
    // 第 4 次：scheduledPosts
    expect(mockPrisma.post.count).toHaveBeenNthCalledWith(4, {
      where: { status: 'SCHEDULED' },
    });
    // 第 5 次：recentPostsCount（7 天內）
    const fifthCall = (mockPrisma.post.count as jest.Mock).mock.calls[4];
    expect(fifthCall[0]).toHaveProperty('where.createdAt.gte');
    const gteDate = fifthCall[0].where.createdAt.gte as Date;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    // 容許 1 秒誤差
    expect(Math.abs(gteDate.getTime() - sevenDaysAgo)).toBeLessThan(1000);
  });

  it('所有計數為零時應回傳正確結構', async () => {
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.category.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

    const stats = await getDashboardStats();

    expect(stats).toEqual({
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      scheduledPosts: 0,
      totalCategories: 0,
      totalTags: 0,
      totalMedia: 0,
      recentPostsCount: 0,
    });
  });
});

// ─── getRecentActivity ──────────────────────────────────────────────

describe('getRecentActivity', () => {
  const now = new Date('2024-06-15T10:00:00.000Z');

  /** 建立 mock 文章 */
  function mockPost(overrides: Partial<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {}) {
    return {
      id: 'post-1',
      title: '測試文章',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  /** 建立 mock 分類 */
  function mockCategory(overrides: Partial<{
    id: string;
    name: string;
    createdAt: Date;
  }> = {}) {
    return {
      id: 'cat-1',
      name: '技術',
      createdAt: now,
      ...overrides,
    };
  }

  /** 建立 mock 標籤 */
  function mockTagData(overrides: Partial<{
    id: string;
    name: string;
    createdAt: Date;
  }> = {}) {
    return {
      id: 'tag-1',
      name: 'JavaScript',
      createdAt: now,
      ...overrides,
    };
  }

  /** 建立 mock 媒體 */
  function mockMedia(overrides: Partial<{
    id: string;
    filename: string;
    createdAt: Date;
  }> = {}) {
    return {
      id: 'media-1',
      filename: 'photo.jpg',
      createdAt: now,
      ...overrides,
    };
  }

  it('應回傳合併各來源的活動並按時間降序排列', async () => {
    const t1 = new Date('2024-06-15T09:00:00.000Z');
    const t2 = new Date('2024-06-15T08:00:00.000Z');
    const t3 = new Date('2024-06-15T07:00:00.000Z');
    const t4 = new Date('2024-06-15T06:00:00.000Z');

    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      mockPost({ id: 'post-1', title: '新文章', status: 'DRAFT', createdAt: t1, updatedAt: t1 }),
      mockPost({ id: 'post-2', title: '已發佈', status: 'PUBLISHED', createdAt: t3, updatedAt: t3 }),
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      mockCategory({ id: 'cat-1', name: '技術', createdAt: t2 }),
    ]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([
      mockTagData({ id: 'tag-1', name: 'React', createdAt: t4 }),
    ]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities).toHaveLength(4);
    // 應按時間降序排列
    expect(activities[0].timestamp).toEqual(t1);
    expect(activities[1].timestamp).toEqual(t2);
    expect(activities[2].timestamp).toEqual(t3);
    expect(activities[3].timestamp).toEqual(t4);
  });

  it('文章 DRAFT 狀態應產生 post_created 活動', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      mockPost({ id: 'post-1', title: '草稿文章', status: 'DRAFT', createdAt: now, updatedAt: now }),
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities[0]).toMatchObject({
      type: 'post_created',
      title: '草稿文章',
    });
  });

  it('文章 PUBLISHED 狀態應產生 post_published 活動', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      mockPost({ id: 'post-1', title: '已發佈文章', status: 'PUBLISHED', createdAt: now, updatedAt: now }),
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities[0]).toMatchObject({
      type: 'post_published',
      title: '已發佈文章',
    });
  });

  it('文章 updatedAt 與 createdAt 不同時應產生 post_updated 活動', async () => {
    const created = new Date('2024-06-10T00:00:00.000Z');
    const updated = new Date('2024-06-15T00:00:00.000Z');

    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      mockPost({ id: 'post-1', title: '已更新文章', status: 'DRAFT', createdAt: created, updatedAt: updated }),
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    // 應有兩個活動：建立 + 更新
    const updateActivity = activities.find((a) => a.type === 'post_updated');
    expect(updateActivity).toBeDefined();
    expect(updateActivity?.timestamp).toEqual(updated);
  });

  it('分類建立應產生 category_created 活動', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      mockCategory({ id: 'cat-1', name: '生活', createdAt: now }),
    ]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities[0]).toMatchObject({
      type: 'category_created',
      title: '生活',
    });
  });

  it('標籤建立應產生 tag_created 活動', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([
      mockTagData({ id: 'tag-1', name: 'TypeScript', createdAt: now }),
    ]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities[0]).toMatchObject({
      type: 'tag_created',
      title: 'TypeScript',
    });
  });

  it('媒體上傳應產生 media_uploaded 活動', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([
      mockMedia({ id: 'media-1', filename: 'banner.png', createdAt: now }),
    ]);

    const activities = await getRecentActivity();

    expect(activities[0]).toMatchObject({
      type: 'media_uploaded',
      title: 'banner.png',
    });
  });

  it('應限制回傳筆數（預設 10）', async () => {
    const posts = Array.from({ length: 15 }, (_, i) =>
      mockPost({
        id: `post-${i}`,
        title: `文章 ${i}`,
        createdAt: new Date(now.getTime() - i * 1000),
        updatedAt: new Date(now.getTime() - i * 1000),
      })
    );

    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities.length).toBeLessThanOrEqual(10);
  });

  it('可自訂 limit 參數', async () => {
    const posts = Array.from({ length: 10 }, (_, i) =>
      mockPost({
        id: `post-${i}`,
        title: `文章 ${i}`,
        createdAt: new Date(now.getTime() - i * 1000),
        updatedAt: new Date(now.getTime() - i * 1000),
      })
    );

    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity(5);

    expect(activities).toHaveLength(5);
  });

  it('無任何資料時應回傳空陣列', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities).toEqual([]);
  });

  it('每個活動應包含必要欄位', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([
      mockPost({ id: 'post-1', title: '文章', createdAt: now, updatedAt: now }),
    ]);
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

    const activities = await getRecentActivity();

    expect(activities[0]).toHaveProperty('id');
    expect(activities[0]).toHaveProperty('type');
    expect(activities[0]).toHaveProperty('title');
    expect(activities[0]).toHaveProperty('description');
    expect(activities[0]).toHaveProperty('timestamp');
  });
});
