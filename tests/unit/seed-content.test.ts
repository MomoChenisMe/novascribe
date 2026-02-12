/**
 * @file 內容種子資料腳本測試
 * @description 驗證 content seed 腳本的行為：
 *   - 建立範例分類（含層級）
 *   - 建立範例標籤
 *   - 建立範例文章（含關聯）
 *   - 使用 upsert 確保可重複執行
 */

const mockCategoryUpsert = jest.fn();
const mockTagUpsert = jest.fn();
const mockPostUpsert = jest.fn();
const mockPostTagCreateMany = jest.fn();
const mockPostVersionCreate = jest.fn();
const mockUserFindFirst = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: mockUserFindFirst,
    },
    category: {
      upsert: mockCategoryUpsert,
    },
    tag: {
      upsert: mockTagUpsert,
    },
    post: {
      upsert: mockPostUpsert,
    },
    postTag: {
      createMany: mockPostTagCreateMany,
    },
    postVersion: {
      create: mockPostVersionCreate,
    },
    $disconnect: mockDisconnect,
  },
}));

describe('內容種子資料腳本', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'admin@novascribe.local',
    });

    mockCategoryUpsert.mockImplementation(async (args: { where: { slug: string }; create: { id: string; name: string; slug: string } }) => ({
      id: args.create.id || `cat-${args.where.slug}`,
      name: args.create.name,
      slug: args.where.slug,
    }));

    mockTagUpsert.mockImplementation(async (args: { where: { slug: string }; create: { id: string; name: string; slug: string } }) => ({
      id: args.create.id || `tag-${args.where.slug}`,
      name: args.create.name,
      slug: args.where.slug,
    }));

    mockPostUpsert.mockImplementation(async (args: { where: { slug: string }; create: { id: string; title: string; slug: string } }) => ({
      id: args.create.id || `post-${args.where.slug}`,
      title: args.create.title,
      slug: args.where.slug,
    }));

    mockPostTagCreateMany.mockResolvedValue({ count: 1 });
    mockPostVersionCreate.mockResolvedValue({ id: 'version-1' });
  });

  it('應先查找管理者使用者', async () => {
    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    expect(mockUserFindFirst).toHaveBeenCalledTimes(1);
  });

  it('找不到使用者時應拋出錯誤', async () => {
    mockUserFindFirst.mockResolvedValue(null);
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await expect(seedContent()).rejects.toThrow();
  });

  it('應建立範例分類', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    // 至少要建立 2 個分類
    expect(mockCategoryUpsert.mock.calls.length).toBeGreaterThanOrEqual(2);

    // 每個 upsert 都應該有 where、create、update
    for (const call of mockCategoryUpsert.mock.calls) {
      const args = call[0];
      expect(args).toHaveProperty('where');
      expect(args).toHaveProperty('create');
      expect(args).toHaveProperty('update');
      expect(args.create).toHaveProperty('name');
      expect(args.create).toHaveProperty('slug');
    }
  });

  it('應建立範例標籤', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    // 至少要建立 3 個標籤
    expect(mockTagUpsert.mock.calls.length).toBeGreaterThanOrEqual(3);

    for (const call of mockTagUpsert.mock.calls) {
      const args = call[0];
      expect(args).toHaveProperty('where');
      expect(args.create).toHaveProperty('name');
      expect(args.create).toHaveProperty('slug');
    }
  });

  it('應建立範例文章', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    // 至少要建立 2 篇文章
    expect(mockPostUpsert.mock.calls.length).toBeGreaterThanOrEqual(2);

    for (const call of mockPostUpsert.mock.calls) {
      const args = call[0];
      expect(args).toHaveProperty('where');
      expect(args.create).toHaveProperty('title');
      expect(args.create).toHaveProperty('slug');
      expect(args.create).toHaveProperty('content');
      expect(args.create).toHaveProperty('authorId');
    }
  });

  it('文章應包含不同狀態', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    const statuses = mockPostUpsert.mock.calls.map(
      (call: [{ create: { status: string } }]) => call[0].create.status
    );
    // 至少包含 DRAFT 和 PUBLISHED 兩種狀態
    expect(statuses).toContain('DRAFT');
    expect(statuses).toContain('PUBLISHED');
  });

  it('應為文章建立標籤關聯', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    expect(mockPostTagCreateMany).toHaveBeenCalled();

    for (const call of mockPostTagCreateMany.mock.calls) {
      const args = call[0];
      expect(args).toHaveProperty('data');
      expect(args).toHaveProperty('skipDuplicates', true);
    }
  });

  it('應為文章建立版本記錄', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { findFirst: mockUserFindFirst },
        category: { upsert: mockCategoryUpsert },
        tag: { upsert: mockTagUpsert },
        post: { upsert: mockPostUpsert },
        postTag: { createMany: mockPostTagCreateMany },
        postVersion: { create: mockPostVersionCreate },
        $disconnect: mockDisconnect,
      },
    }));

    const { seedContent } = await import('../../prisma/seed-content');
    await seedContent();

    // 每篇文章至少要有一個版本記錄
    expect(mockPostVersionCreate).toHaveBeenCalled();

    for (const call of mockPostVersionCreate.mock.calls) {
      const args = call[0];
      expect(args.data).toHaveProperty('postId');
      expect(args.data).toHaveProperty('title');
      expect(args.data).toHaveProperty('content');
      expect(args.data).toHaveProperty('version');
    }
  });
});
