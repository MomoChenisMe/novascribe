/**
 * Atom Feed 測試
 * GET /feed/atom.xml
 */

jest.mock('feed');

// Mock Prisma
const mockPrisma = {
  post: {
    findMany: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock Markdown 渲染
jest.mock('@/lib/markdown', () => ({
  renderMarkdown: jest.fn((content: string) => `<p>${content}</p>`),
}));

import { GET } from '@/app/feed/atom/route';

describe('GET /feed/atom.xml', () => {
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該返回 Atom XML', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(response.headers.get('Content-Type')).toContain('application/atom+xml');
    expect(text).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(text).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
  });

  it('應該包含 feed 基本資訊', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<title>NovaScribe</title>');
    expect(text).toContain('<id>');
    expect(text).toContain('<link');
  });

  it('應該包含文章條目', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<entry>');
    expect(text).toContain('<title>測試文章 1</title>');
    expect(text).toContain('<summary>這是測試文章 1 的摘要</summary>');
  });

  it('應該包含全文內容', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    const response = await GET();
    const text = await response.text();

    expect(text).toContain('<content type="html">');
    expect(text).toContain('&lt;p&gt;'); // HTML 實體編碼
  });

  it('應該只查詢 PUBLISHED 狀態的文章', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPosts);

    await GET();

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED' },
      })
    );
  });

  it('空文章列表時應該返回有效的 Feed', async () => {
    mockPrisma.post.findMany.mockResolvedValue([]);

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
  });
});
