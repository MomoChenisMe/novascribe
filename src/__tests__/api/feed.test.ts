/**
 * RSS 2.0 Feed 測試
 * GET /feed.xml
 */

jest.mock('feed');

// Mock Prisma with factory function
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
    },
  },
}));

// Mock Markdown 渲染
jest.mock('@/lib/markdown', () => ({
  renderMarkdown: jest.fn((content: string) => `<p>${content}</p>`),
}));

import { GET } from '@/app/feed/route';
import prisma from '@/lib/prisma';

describe('GET /feed.xml', () => {
  const mockPosts = [
    {
      id: 'post-1',
      title: '測試文章 1',
      slug: 'test-post-1',
      excerpt: '這是測試文章 1 的摘要',
      content: '# 測試內容 1',
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      category: {
        id: 'cat-1',
        name: '技術',
        slug: 'tech',
      },
    },
    {
      id: 'post-2',
      title: '測試文章 2',
      slug: 'test-post-2',
      excerpt: '這是測試文章 2 的摘要',
      content: '# 測試內容 2',
      publishedAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-03'),
      category: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該返回 RSS 2.0 XML', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
    expect(text).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(text).toContain('<rss version="2.0"');
  });

  it('應該包含 channel 資訊', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<title>NovaScribe</title>');
    expect(text).toContain('<language>zh-Hant</language>');
    expect(text).toContain('<link>');
  });

  it('應該包含所有已發佈文章', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('測試文章 1');
    expect(text).toContain('測試文章 2');
  });

  it('應該包含文章的完整資訊', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<title>測試文章 1</title>');
    expect(text).toContain('<description>這是測試文章 1 的摘要</description>');
    expect(text).toContain('<link>');
    expect(text).toContain('/posts/test-post-1');
    expect(text).toContain('<pubDate>');
  });

  it('應該包含分類資訊', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<category>技術</category>');
  });

  it('應該包含全文內容', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPosts[0]]);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<content:encoded>');
    expect(text).toContain('<p>');
  });

  it('應該只查詢 PUBLISHED 狀態的文章', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    await GET();

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED' },
      })
    );
  });

  it('應該按 publishedAt 降序排列', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    await GET();

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { publishedAt: 'desc' },
      })
    );
  });

  it('應該限制文章數量', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

    await GET();

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: expect.any(Number),
      })
    );
  });

  it('空文章列表時應該返回有效的 Feed', async () => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('<rss version="2.0"');
    expect(text).toContain('<channel>');
  });
});
