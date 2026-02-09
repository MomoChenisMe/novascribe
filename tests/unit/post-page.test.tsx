/**
 * @file 文章列表頁面元件測試
 * @description 測試文章列表頁面的 UI 互動
 *   - 表格渲染：標題、狀態、分類、發佈時間、更新時間、操作按鈕
 *   - 篩選控制項：狀態篩選、分類篩選
 *   - 搜尋輸入：debounce 搜尋
 *   - 排序：發佈時間/更新時間
 *   - 分頁：分頁控制
 *   - 批次操作 UI：勾選多筆 → 批次刪除/發佈/下架
 *   - 載入/錯誤狀態
 */

import React from 'react';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostsPage from '@/app/(admin)/admin/posts/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Mock 文章資料 */
const mockPostsData = [
  {
    id: 'post-1',
    title: '第一篇文章',
    slug: 'first-post',
    status: 'PUBLISHED',
    category: { id: 'cat-1', name: '技術' },
    publishedAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-16T12:00:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'post-2',
    title: '草稿文章',
    slug: 'draft-post',
    status: 'DRAFT',
    category: null,
    publishedAt: null,
    updatedAt: '2024-01-17T08:00:00.000Z',
    createdAt: '2024-01-17T08:00:00.000Z',
  },
  {
    id: 'post-3',
    title: '排程文章',
    slug: 'scheduled-post',
    status: 'SCHEDULED',
    category: { id: 'cat-2', name: '生活' },
    publishedAt: null,
    updatedAt: '2024-01-18T09:00:00.000Z',
    createdAt: '2024-01-18T09:00:00.000Z',
  },
];

const mockPaginationMeta = {
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const mockCategoriesData = [
  { id: 'cat-1', name: '技術', slug: 'tech' },
  { id: 'cat-2', name: '生活', slug: 'life' },
];

/** 設定 fetch 回傳資料 */
function setupFetchResponses(overrides?: {
  posts?: typeof mockPostsData;
  meta?: typeof mockPaginationMeta;
  categories?: typeof mockCategoriesData;
}) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : '';

    // 分類列表
    if (urlStr.includes('/api/admin/categories')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: overrides?.categories ?? mockCategoriesData,
          }),
      });
    }

    // 批次操作
    if (urlStr.includes('/api/admin/posts/batch') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, count: 2 }),
      });
    }

    // 單篇刪除
    if (options?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    // 文章列表
    if (urlStr.includes('/api/admin/posts')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: overrides?.posts ?? mockPostsData,
            meta: overrides?.meta ?? mockPaginationMeta,
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

describe('文章列表頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('載入狀態', () => {
    it('載入時應顯示「載入中...」', () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      render(<PostsPage />);
      expect(screen.getByText('載入中...')).toBeInTheDocument();
    });
  });

  describe('表格渲染', () => {
    it('應渲染文章列表表格', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
        expect(screen.getByText('草稿文章')).toBeInTheDocument();
        expect(screen.getByText('排程文章')).toBeInTheDocument();
      });
    });

    it('應顯示文章狀態', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        // 狀態文字同時出現在篩選下拉和表格中，使用 getAllByText
        const published = screen.getAllByText('已發佈');
        expect(published.length).toBeGreaterThanOrEqual(2); // 篩選 + 表格
        const draft = screen.getAllByText('草稿');
        expect(draft.length).toBeGreaterThanOrEqual(2);
        const scheduled = screen.getAllByText('排程中');
        expect(scheduled.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('應顯示分類名稱', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        // 分類名稱同時出現在篩選下拉和表格中
        const techItems = screen.getAllByText('技術');
        expect(techItems.length).toBeGreaterThanOrEqual(2);
        const lifeItems = screen.getAllByText('生活');
        expect(lifeItems.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('應顯示操作按鈕', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('編輯');
        expect(editButtons.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('應顯示新增文章按鈕', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('新增文章')).toBeInTheDocument();
      });
    });

    it('空列表應顯示「尚無文章」', async () => {
      setupFetchResponses({
        posts: [],
        meta: { ...mockPaginationMeta, total: 0, totalPages: 0 },
      });
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('尚無文章')).toBeInTheDocument();
      });
    });
  });

  describe('篩選控制項', () => {
    it('應顯示狀態篩選下拉', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('狀態篩選')).toBeInTheDocument();
      });
    });

    it('應顯示分類篩選下拉', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('分類篩選')).toBeInTheDocument();
      });
    });

    it('切換狀態篩選應觸發查詢', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('狀態篩選')).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText('狀態篩選'), 'PUBLISHED');

      await waitFor(() => {
        const calls = mockFetch.mock.calls.filter(
          (call: [string]) =>
            typeof call[0] === 'string' && call[0].includes('status=PUBLISHED')
        );
        expect(calls.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('切換分類篩選應觸發查詢', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('分類篩選')).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText('分類篩選'), 'cat-1');

      await waitFor(() => {
        const calls = mockFetch.mock.calls.filter(
          (call: [string]) =>
            typeof call[0] === 'string' && call[0].includes('categoryId=cat-1')
        );
        expect(calls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('搜尋輸入', () => {
    it('應顯示搜尋框', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('搜尋文章...')).toBeInTheDocument();
      });
    });

    it('輸入搜尋關鍵字應在 debounce 後觸發查詢', async () => {
      setupFetchResponses();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PostsPage />);

      // 等待初始載入
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('搜尋文章...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('搜尋文章...');
      await user.type(searchInput, 'test');

      // 在 debounce 之前不應觸發搜尋
      const callsBefore = mockFetch.mock.calls.filter(
        (call: [string]) =>
          typeof call[0] === 'string' && call[0].includes('search=test')
      );
      expect(callsBefore.length).toBe(0);

      // debounce 500ms 後應觸發搜尋
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const callsAfter = mockFetch.mock.calls.filter(
          (call: [string]) =>
            typeof call[0] === 'string' && call[0].includes('search=test')
        );
        expect(callsAfter.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('排序', () => {
    it('應顯示可排序的表頭', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText(/更新時間/)).toBeInTheDocument();
      });
    });

    it('點擊排序表頭應切換排序', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
      });

      // 點擊「更新時間」排序
      const sortButton = screen.getByRole('button', { name: /更新時間/ });
      await user.click(sortButton);

      await waitFor(() => {
        const calls = mockFetch.mock.calls.filter(
          (call: [string]) =>
            typeof call[0] === 'string' && call[0].includes('sortBy=updatedAt')
        );
        expect(calls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('分頁', () => {
    it('多頁時應顯示分頁控制', async () => {
      setupFetchResponses({
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
      });
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('共 50 筆，第 1/5 頁')).toBeInTheDocument();
        expect(screen.getByText('上一頁')).toBeDisabled();
        expect(screen.getByText('下一頁')).not.toBeDisabled();
      });
    });

    it('只有一頁時不應顯示分頁控制', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
      });

      expect(screen.queryByText('上一頁')).not.toBeInTheDocument();
    });

    it('點擊下一頁應更新分頁', async () => {
      setupFetchResponses({
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
      });
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('下一頁')).toBeInTheDocument();
      });

      await user.click(screen.getByText('下一頁'));

      await waitFor(() => {
        const calls = mockFetch.mock.calls.filter(
          (call: [string]) =>
            typeof call[0] === 'string' && call[0].includes('page=2')
        );
        expect(calls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('批次操作', () => {
    it('應顯示全選 checkbox', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('全選')).toBeInTheDocument();
      });
    });

    it('勾選文章後應顯示批次操作按鈕', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
      });

      // 勾選第一筆
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // 第 0 個是全選

      expect(screen.getByText('批次刪除')).toBeInTheDocument();
      expect(screen.getByText('批次發佈')).toBeInTheDocument();
      expect(screen.getByText('批次下架')).toBeInTheDocument();
    });

    it('點擊全選應選中所有文章', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('全選'));

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((cb) => {
        expect(cb).toBeChecked();
      });
    });

    it('批次刪除應呼叫批次 API', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('第一篇文章')).toBeInTheDocument();
      });

      // 勾選全部
      await user.click(screen.getByLabelText('全選'));

      // 點擊批次刪除
      await user.click(screen.getByText('批次刪除'));

      // 確認 modal
      await waitFor(() => {
        expect(screen.getByText(/確定要批次/)).toBeInTheDocument();
      });

      await user.click(screen.getByText('確定'));

      await waitFor(() => {
        const batchCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            typeof call[0] === 'string' &&
            call[0].includes('/api/admin/posts/batch') &&
            call[1]?.method === 'POST'
        );
        expect(batchCalls.length).toBe(1);
        const body = JSON.parse(batchCalls[0][1]?.body as string);
        expect(body.action).toBe('delete');
        expect(body.ids).toHaveLength(3);
      });
    });
  });

  describe('導航', () => {
    it('點擊新增文章按鈕應導航到新增頁面', async () => {
      setupFetchResponses();
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('新增文章')).toBeInTheDocument();
      });

      await user.click(screen.getByText('新增文章'));
      expect(mockPush).toHaveBeenCalledWith('/admin/posts/new');
    });
  });

  describe('錯誤處理', () => {
    it('API 錯誤應顯示錯誤訊息', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      jest.useRealTimers();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('載入失敗')).toBeInTheDocument();
      });
    });
  });
});
