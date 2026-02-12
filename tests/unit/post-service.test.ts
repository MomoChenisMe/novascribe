/**
 * @file 文章 Service 層測試
 * @description 測試文章 CRUD、查詢邏輯
 *   - createPost：建立文章（含自動版本建立、標籤關聯）
 *   - updatePost：更新文章（版本遞增、標籤更新）
 *   - deletePost：刪除文章
 *   - getPostById：取得單篇文章（含關聯）
 *   - getPosts：列表查詢（分頁/篩選/搜尋/排序）
 */

import {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPosts,
} from '@/services/post.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    postVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    postTag: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock 文章資料 */
function mockPost(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    status: string;
    publishedAt: Date | null;
    scheduledAt: Date | null;
    authorId: string;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
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

// ===== createPost =====
describe('createPost', () => {
  it('應成功建立文章並自動建立版本', async () => {
    const newPost = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);
    // Mock $transaction 以執行回呼函式
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { create: jest.fn().mockResolvedValue(newPost) },
        postVersion: { create: jest.fn().mockResolvedValue({}) },
        postTag: { createMany: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const result = await createPost({
      title: '測試文章',
      slug: 'test-post',
      content: '# 測試內容',
      authorId: 'user-1',
    });

    expect(result).toEqual(newPost);

    // 驗證 transaction 被呼叫
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    // 驗證 transaction 回呼中建立了文章和版本
    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { create: jest.fn().mockResolvedValue(newPost) },
      postVersion: { create: jest.fn().mockResolvedValue({}) },
      postTag: { createMany: jest.fn().mockResolvedValue({}) },
    };
    await txFn(mockTx);

    expect(mockTx.post.create).toHaveBeenCalledWith({
      data: {
        title: '測試文章',
        slug: 'test-post',
        content: '# 測試內容',
        excerpt: null,
        coverImage: null,
        status: 'DRAFT',
        publishedAt: null,
        scheduledAt: null,
        categoryId: null,
        authorId: 'user-1',
      },
    });

    expect(mockTx.postVersion.create).toHaveBeenCalledWith({
      data: {
        postId: 'post-1',
        title: '測試文章',
        content: '# 測試內容',
        version: 1,
      },
    });
  });

  it('應在 slug 已存在時拋出錯誤', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost());

    await expect(
      createPost({
        title: '測試文章',
        slug: 'test-post',
        content: '# 測試內容',
        authorId: 'user-1',
      })
    ).rejects.toThrow('Slug "test-post" already exists');
  });

  it('應支援指定分類和標籤', async () => {
    const newPost = mockPost({ categoryId: 'cat-1' });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { create: jest.fn().mockResolvedValue(newPost) },
        postVersion: { create: jest.fn().mockResolvedValue({}) },
        postTag: { createMany: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    await createPost({
      title: '測試文章',
      slug: 'test-post',
      content: '# 測試內容',
      authorId: 'user-1',
      categoryId: 'cat-1',
      tagIds: ['tag-1', 'tag-2'],
    });

    // 驗證標籤關聯建立
    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { create: jest.fn().mockResolvedValue(newPost) },
      postVersion: { create: jest.fn().mockResolvedValue({}) },
      postTag: { createMany: jest.fn().mockResolvedValue({}) },
    };
    await txFn(mockTx);

    expect(mockTx.postTag.createMany).toHaveBeenCalledWith({
      data: [
        { postId: 'post-1', tagId: 'tag-1' },
        { postId: 'post-1', tagId: 'tag-2' },
      ],
    });
  });

  it('應支援指定狀態和發佈時間', async () => {
    const publishedAt = new Date('2024-06-01');
    const newPost = mockPost({ status: 'PUBLISHED', publishedAt });
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { create: jest.fn().mockResolvedValue(newPost) },
        postVersion: { create: jest.fn().mockResolvedValue({}) },
        postTag: { createMany: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const result = await createPost({
      title: '測試文章',
      slug: 'test-post',
      content: '# 測試內容',
      authorId: 'user-1',
      status: 'PUBLISHED' as any,
      publishedAt,
    });

    expect(result.status).toBe('PUBLISHED');
  });

  it('沒有 tagIds 時不應建立標籤關聯', async () => {
    const newPost = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { create: jest.fn().mockResolvedValue(newPost) },
        postVersion: { create: jest.fn().mockResolvedValue({}) },
        postTag: { createMany: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    await createPost({
      title: '測試文章',
      slug: 'test-post',
      content: '# 測試內容',
      authorId: 'user-1',
    });

    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { create: jest.fn().mockResolvedValue(newPost) },
      postVersion: { create: jest.fn().mockResolvedValue({}) },
      postTag: { createMany: jest.fn().mockResolvedValue({}) },
    };
    await txFn(mockTx);

    expect(mockTx.postTag.createMany).not.toHaveBeenCalled();
  });
});

// ===== updatePost =====
describe('updatePost', () => {
  it('應成功更新文章並建立新版本', async () => {
    const existing = mockPost();
    const updated = mockPost({ title: '更新後的標題' });

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(existing);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { update: jest.fn().mockResolvedValue(updated) },
        postVersion: {
          create: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue({ version: 1 }),
        },
        postTag: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    const result = await updatePost('post-1', { title: '更新後的標題' });

    expect(result.title).toBe('更新後的標題');
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('應在文章不存在時拋出錯誤', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updatePost('nonexistent', { title: '更新' })
    ).rejects.toThrow('Post "nonexistent" not found');
  });

  it('應在 slug 重複時拋出錯誤（排除自己）', async () => {
    const existing = mockPost({ id: 'post-1' });
    const other = mockPost({ id: 'post-2', slug: 'other-post' });

    (mockPrisma.post.findUnique as jest.Mock)
      .mockResolvedValueOnce(existing) // 文章存在
      .mockResolvedValueOnce(other); // slug 被其他文章使用

    await expect(
      updatePost('post-1', { slug: 'other-post' })
    ).rejects.toThrow('Slug "other-post" already exists');
  });

  it('應允許更新自己的 slug 為同一個值', async () => {
    const existing = mockPost();
    (mockPrisma.post.findUnique as jest.Mock)
      .mockResolvedValueOnce(existing) // 文章存在
      .mockResolvedValueOnce(existing); // 同一個文章
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { update: jest.fn().mockResolvedValue(existing) },
        postVersion: {
          create: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        postTag: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    const result = await updatePost('post-1', { slug: 'test-post' });
    expect(result).toEqual(existing);
  });

  it('更新標籤時應先刪除舊關聯再建立新關聯', async () => {
    const existing = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(existing);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { update: jest.fn().mockResolvedValue(existing) },
        postVersion: {
          create: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        postTag: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    await updatePost('post-1', { tagIds: ['tag-3', 'tag-4'] });

    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { update: jest.fn().mockResolvedValue(existing) },
      postVersion: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      postTag: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
    };
    await txFn(mockTx);

    expect(mockTx.postTag.deleteMany).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
    });
    expect(mockTx.postTag.createMany).toHaveBeenCalledWith({
      data: [
        { postId: 'post-1', tagId: 'tag-3' },
        { postId: 'post-1', tagId: 'tag-4' },
      ],
    });
  });

  it('版本號碼應遞增', async () => {
    const existing = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(existing);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { update: jest.fn().mockResolvedValue(existing) },
        postVersion: {
          create: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue({ version: 3 }),
        },
        postTag: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    await updatePost('post-1', { title: '新標題' });

    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { update: jest.fn().mockResolvedValue(existing) },
      postVersion: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn().mockResolvedValue({ version: 3 }),
      },
      postTag: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
    };
    await txFn(mockTx);

    expect(mockTx.postVersion.create).toHaveBeenCalledWith({
      data: {
        postId: 'post-1',
        title: '新標題',
        content: '# 測試內容',
        version: 4,
      },
    });
  });

  it('只更新非 title/content 欄位時不應建立新版本', async () => {
    const existing = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(existing);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        post: { update: jest.fn().mockResolvedValue(existing) },
        postVersion: {
          create: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        postTag: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    await updatePost('post-1', { excerpt: '摘要' });

    const txFn = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTx = {
      post: { update: jest.fn().mockResolvedValue(existing) },
      postVersion: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      postTag: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
    };
    await txFn(mockTx);

    expect(mockTx.postVersion.create).not.toHaveBeenCalled();
  });
});

// ===== deletePost =====
describe('deletePost', () => {
  it('應成功刪除文章', async () => {
    const post = mockPost();
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);
    (mockPrisma.post.delete as jest.Mock).mockResolvedValue(post);

    await deletePost('post-1');

    expect(mockPrisma.post.delete).toHaveBeenCalledWith({
      where: { id: 'post-1' },
    });
  });

  it('應在文章不存在時拋出錯誤', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(deletePost('nonexistent')).rejects.toThrow(
      'Post "nonexistent" not found'
    );
  });
});

// ===== getPostById =====
describe('getPostById', () => {
  it('應回傳文章含關聯資料', async () => {
    const post = {
      ...mockPost(),
      category: { id: 'cat-1', name: '技術', slug: 'tech' },
      tags: [{ tag: { id: 'tag-1', name: 'JavaScript', slug: 'javascript' } }],
      author: { id: 'user-1', name: '作者', email: 'author@test.com' },
    };
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(post);

    const result = await getPostById('post-1');

    expect(result).toEqual(post);
    expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });
  });

  it('應在文章不存在時回傳 null', async () => {
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getPostById('nonexistent');
    expect(result).toBeNull();
  });
});

// ===== getPosts =====
describe('getPosts', () => {
  it('應回傳分頁資料', async () => {
    const posts = [mockPost()];
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(posts);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(1);

    const result = await getPosts({ page: 1, limit: 10 });

    expect(result.data).toEqual(posts);
    expect(result.total).toBe(1);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      })
    );
  });

  it('應支援狀態篩選', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ status: 'PUBLISHED' as any });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' }),
      })
    );
  });

  it('應支援分類篩選', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ categoryId: 'cat-1' });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: 'cat-1' }),
      })
    );
  });

  it('應支援標籤篩選', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ tagId: 'tag-1' });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { some: { tagId: 'tag-1' } },
        }),
      })
    );
  });

  it('應支援搜尋 title 和 content', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ search: 'JavaScript' });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'JavaScript', mode: 'insensitive' } },
            { content: { contains: 'JavaScript', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('應支援排序', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ sortBy: 'publishedAt', sortOrder: 'asc' });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { publishedAt: 'asc' },
      })
    );
  });

  it('預設值應為 page=1, limit=20, sortBy=createdAt, sortOrder=desc', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts();

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('應支援作者篩選', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ authorId: 'user-1' });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: 'user-1' }),
      })
    );
  });

  it('應計算正確的 skip', async () => {
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.post.count as jest.Mock).mockResolvedValue(0);

    await getPosts({ page: 3, limit: 10 });

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    );
  });
});
