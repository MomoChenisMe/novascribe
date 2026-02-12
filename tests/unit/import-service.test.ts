/**
 * @file 匯入 Service 層測試
 * @description 測試文章匯入邏輯
 *   - importPost：從 Markdown + front matter 匯入文章
 *   - Markdown 解析、front matter 解析
 *   - 分類/標籤自動匹配/建立
 *
 * @jest-environment node
 */

import { importPost } from '@/services/import.service';
import { prisma } from '@/lib/prisma';
import * as slugLib from '@/lib/slug';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    tag: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    postTag: {
      createMany: jest.fn(),
    },
    postVersion: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock slug module
jest.mock('@/lib/slug', () => ({
  generateSlug: jest.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
  ensureUniqueSlug: jest.fn((slug: string) => Promise.resolve(slug)),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockSlug = slugLib as jest.Mocked<typeof slugLib>;

/** 完整 Markdown with front matter */
const fullMarkdown = `---
title: "測試文章"
slug: "test-article"
date: "2024-01-15T10:00:00.000Z"
excerpt: "摘要內容"
coverImage: "/uploads/cover.webp"
category: "技術"
tags:
  - "JavaScript"
  - "TypeScript"
status: "PUBLISHED"
---

# 文章內容

這是正文...
`;

/** 最小 Markdown（只有必填） */
const minimalMarkdown = `---
title: "最小文章"
slug: "minimal-article"
---

這是最簡單的文章
`;

/** 無 front matter 的 Markdown */
const noFrontMatterMarkdown = `# 沒有 front matter

這是正文
`;

/** Mock 建立的文章 */
function mockCreatedPost(overrides = {}) {
  return {
    id: 'new-post-1',
    title: '測試文章',
    slug: 'test-article',
    content: '# 文章內容\n\n這是正文...',
    excerpt: '摘要內容',
    coverImage: '/uploads/cover.webp',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-15T10:00:00.000Z'),
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // 預設 $transaction 直接執行傳入的 callback
  (mockPrisma.$transaction as jest.Mock).mockImplementation(
    async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(mockPrisma)
  );
  // 預設 post.findUnique 回傳 null（slug 不衝突）
  (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);
  // 預設 ensureUniqueSlug 回傳原 slug
  mockSlug.ensureUniqueSlug.mockImplementation(async (slug: string) => slug);
});

// ===== 基本解析 =====
describe('Markdown 解析', () => {
  it('應解析完整 front matter 並建立文章', async () => {
    const mockPost = mockCreatedPost();
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 'tag-1', name: 'JavaScript', slug: 'javascript' })
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    const result = await importPost(fullMarkdown, 'user-1');

    expect(result).toEqual(mockPost);

    // 驗證 post.create 呼叫
    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: '測試文章',
        slug: 'test-article',
        content: expect.stringContaining('# 文章內容'),
        excerpt: '摘要內容',
        coverImage: '/uploads/cover.webp',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15T10:00:00.000Z'),
        authorId: 'user-1',
        categoryId: 'cat-1',
      }),
    });
  });

  it('應正確處理最小 front matter', async () => {
    const mockPost = mockCreatedPost({
      title: '最小文章',
      slug: 'minimal-article',
      status: 'DRAFT',
    });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(minimalMarkdown, 'user-1');

    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: '最小文章',
        slug: 'minimal-article',
        status: 'DRAFT',
        authorId: 'user-1',
      }),
    });
  });

  it('缺少 title 時應拋出錯誤', async () => {
    const noTitle = `---
slug: "no-title"
---

內容
`;
    await expect(importPost(noTitle, 'user-1')).rejects.toThrow('title');
  });

  it('缺少 slug 時應從 title 自動生成', async () => {
    const noSlug = `---
title: "自動生成 Slug"
---

內容
`;
    mockSlug.generateSlug.mockReturnValue('zi-dong-sheng-cheng-slug');
    const mockPost = mockCreatedPost({ slug: 'zi-dong-sheng-cheng-slug' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(noSlug, 'user-1');

    expect(mockSlug.generateSlug).toHaveBeenCalledWith('自動生成 Slug');
    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'zi-dong-sheng-cheng-slug',
      }),
    });
  });

  it('缺少內容（front matter 後無文字）應使用空字串', async () => {
    const noContent = `---
title: "空內容"
slug: "empty-content"
---
`;
    const mockPost = mockCreatedPost({ content: '' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(noContent, 'user-1');

    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        content: '',
      }),
    });
  });

  it('status 預設為 DRAFT', async () => {
    const mockPost = mockCreatedPost({ status: 'DRAFT' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(minimalMarkdown, 'user-1');

    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'DRAFT',
      }),
    });
  });
});

// ===== 分類匹配/建立 =====
describe('分類自動匹配/建立', () => {
  it('應用 name 匹配現有分類', async () => {
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 'tag-1', name: 'JavaScript', slug: 'javascript' })
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    const mockPost = mockCreatedPost();
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(fullMarkdown, 'user-1');

    expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ name: '技術' }, { slug: expect.any(String) }],
      },
    });
    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ categoryId: 'cat-1' }),
    });
  });

  it('分類不存在時應建立新分類', async () => {
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.category.create as jest.Mock).mockResolvedValue({
      id: 'new-cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 'tag-1', name: 'JavaScript', slug: 'javascript' })
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    const mockPost = mockCreatedPost({ categoryId: 'new-cat-1' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(fullMarkdown, 'user-1');

    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: { name: '技術', slug: expect.any(String) },
    });
  });
});

// ===== 標籤匹配/建立 =====
describe('標籤自動匹配/建立', () => {
  it('應匹配現有標籤', async () => {
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 'tag-1', name: 'JavaScript', slug: 'javascript' })
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    const mockPost = mockCreatedPost();
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(fullMarkdown, 'user-1');

    expect(mockPrisma.tag.findFirst).toHaveBeenCalledTimes(2);
    expect(mockPrisma.postTag.createMany).toHaveBeenCalledWith({
      data: [
        { postId: 'new-post-1', tagId: 'tag-1' },
        { postId: 'new-post-1', tagId: 'tag-2' },
      ],
    });
  });

  it('標籤不存在時應建立新標籤', async () => {
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce(null) // JavaScript 不存在
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    (mockPrisma.tag.create as jest.Mock).mockResolvedValue({
      id: 'new-tag-1',
      name: 'JavaScript',
      slug: 'javascript',
    });
    const mockPost = mockCreatedPost();
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(fullMarkdown, 'user-1');

    expect(mockPrisma.tag.create).toHaveBeenCalledWith({
      data: { name: 'JavaScript', slug: expect.any(String) },
    });
    expect(mockPrisma.postTag.createMany).toHaveBeenCalledWith({
      data: [
        { postId: 'new-post-1', tagId: 'new-tag-1' },
        { postId: 'new-post-1', tagId: 'tag-2' },
      ],
    });
  });
});

// ===== 版本建立 =====
describe('版本建立', () => {
  it('匯入時應建立第一個版本', async () => {
    const mockPost = mockCreatedPost();
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(minimalMarkdown, 'user-1');

    expect(mockPrisma.postVersion.create).toHaveBeenCalledWith({
      data: {
        postId: 'new-post-1',
        title: '最小文章',
        content: expect.any(String),
        version: 1,
      },
    });
  });
});

// ===== slug 去重 =====
describe('slug 去重', () => {
  it('slug 衝突時應使用 ensureUniqueSlug 去重', async () => {
    mockSlug.ensureUniqueSlug.mockResolvedValue('test-article-2');
    const mockPost = mockCreatedPost({ slug: 'test-article-2' });
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: '技術',
      slug: 'ji-shu',
    });
    (mockPrisma.tag.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 'tag-1', name: 'JavaScript', slug: 'javascript' })
      .mockResolvedValueOnce({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' });
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    await importPost(fullMarkdown, 'user-1');

    expect(mockSlug.ensureUniqueSlug).toHaveBeenCalledWith(
      'test-article',
      expect.any(Function)
    );
  });
});
