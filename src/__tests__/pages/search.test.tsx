/**
 * 搜尋結果頁測試
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('搜尋結果頁', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該顯示搜尋關鍵字', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'Next.js' : null),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [],
        pagination: { total: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      }),
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/搜尋：Next.js/i)).toBeInTheDocument();
    });
  });

  it('應該顯示搜尋結果', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'test' : null),
    });

    const mockResults = [
      {
        id: 'post-1',
        title: '測試<mark>文章</mark>',
        slug: 'test-post',
        excerpt: '這是一篇<mark>測試</mark>文章',
        publishedAt: '2025-01-01T00:00:00.000Z',
        category: { name: '技術', slug: 'tech' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: mockResults,
        pagination: { total: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      }),
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/測試/)).toBeInTheDocument();
    });
  });

  it('應該顯示載入狀態', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'test' : null),
    });

    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  results: [],
                  pagination: { total: 0, totalPages: 0, currentPage: 1, perPage: 10 },
                }),
              }),
            100
          );
        })
    );

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    expect(screen.getByText(/載入中/i)).toBeInTheDocument();
  });

  it('應該在無結果時顯示提示', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'nonexistent' : null),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [],
        pagination: { total: 0, totalPages: 0, currentPage: 1, perPage: 10 },
      }),
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/找不到符合的文章/i)).toBeInTheDocument();
    });
  });

  it('應該顯示結果數量', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'test' : null),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: '1', title: 'Post 1', slug: 'post-1', excerpt: '', publishedAt: '', category: null, tags: [] },
          { id: '2', title: 'Post 2', slug: 'post-2', excerpt: '', publishedAt: '', category: null, tags: [] },
        ],
        pagination: { total: 15, totalPages: 2, currentPage: 1, perPage: 10 },
      }),
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/找到 15 篇文章/i)).toBeInTheDocument();
    });
  });

  it('應該在缺少搜尋關鍵字時顯示提示', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/請輸入搜尋關鍵字/i)).toBeInTheDocument();
    });
  });

  it('應該正確渲染高亮的 HTML', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'test' : null),
    });

    const mockResults = [
      {
        id: 'post-1',
        title: '<mark>Test</mark> Article',
        slug: 'test-post',
        excerpt: 'This is a <mark>test</mark>',
        publishedAt: '2025-01-01T00:00:00.000Z',
        category: null,
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: mockResults,
        pagination: { total: 1, totalPages: 1, currentPage: 1, perPage: 10 },
      }),
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      const marks = screen.getAllByText('Test');
      expect(marks.length).toBeGreaterThan(0);
    });
  });

  it('應該在 API 錯誤時顯示錯誤訊息', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'q' ? 'test' : null),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const SearchPage = (await import('@/app/(public)/search/page')).default;
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/搜尋失敗/i)).toBeInTheDocument();
    });
  });
});
