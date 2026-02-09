/**
 * @file 編輯文章頁面元件測試
 * @description 測試編輯文章頁面的 UI 互動
 *   - 資料載入：載入文章資料
 *   - 表單預填：標題、slug、內容、摘要、分類、標籤、狀態
 *   - 更新提交：PUT API 呼叫
 *   - 刪除按鈕：確認 modal → DELETE API
 *   - 版本歷史按鈕
 *   - 載入失敗顯示錯誤
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditPostPage from '@/app/(admin)/admin/posts/[id]/edit/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
  useParams: () => ({
    id: 'post-1',
  }),
}));

// Mock MarkdownEditor
jest.mock('@/components/admin/MarkdownEditor', () => ({
  MarkdownEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockPost = {
  id: 'post-1',
  title: '測試文章標題',
  slug: 'test-post-title',
  content: '# Hello\n\n這是測試內容',
  excerpt: '測試摘要',
  coverImage: '/uploads/cover.webp',
  status: 'DRAFT',
  publishedAt: null,
  scheduledAt: null,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: '技術' },
  tags: [
    { tag: { id: 'tag-1', name: 'JavaScript', slug: 'javascript' } },
    { tag: { id: 'tag-2', name: 'TypeScript', slug: 'typescript' } },
  ],
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-16T12:00:00.000Z',
};

const mockCategories = [
  { id: 'cat-1', name: '技術', slug: 'tech' },
  { id: 'cat-2', name: '生活', slug: 'life' },
];

const mockTags = [
  { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
  { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
  { id: 'tag-3', name: 'React', slug: 'react' },
];

/** 設定 fetch 回傳資料 */
function setupFetchResponses(overrides?: { post?: typeof mockPost | null }) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : '';

    // 取得單篇文章
    if (urlStr.includes('/api/admin/posts/post-1') && (!options || !options.method || options.method === 'GET')) {
      const post = overrides?.post !== undefined ? overrides.post : mockPost;
      if (post === null) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({ success: false, error: '文章不存在' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: post }),
      });
    }

    // 更新文章
    if (urlStr.includes('/api/admin/posts/post-1') && options?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockPost }),
      });
    }

    // 刪除文章
    if (urlStr.includes('/api/admin/posts/post-1') && options?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    // 分類列表
    if (urlStr.includes('/api/admin/categories')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockCategories }),
      });
    }

    // 標籤列表
    if (urlStr.includes('/api/admin/tags')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockTags, meta: { total: 3 } }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

describe('編輯文章頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('資料載入', () => {
    it('載入時應顯示「載入中...」', () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      render(<EditPostPage />);
      expect(screen.getByText('載入中...')).toBeInTheDocument();
    });

    it('載入完成應顯示編輯表單', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('編輯文章')).toBeInTheDocument();
      });
    });

    it('載入失敗應顯示錯誤', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('載入失敗')).toBeInTheDocument();
      });
    });
  });

  describe('表單預填', () => {
    it('應預填標題', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const input = screen.getByLabelText('標題') as HTMLInputElement;
        expect(input.value).toBe('測試文章標題');
      });
    });

    it('應預填 Slug', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const input = screen.getByLabelText('Slug') as HTMLInputElement;
        expect(input.value).toBe('test-post-title');
      });
    });

    it('應預填內容', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const editor = screen.getByTestId('markdown-editor') as HTMLTextAreaElement;
        expect(editor.value).toBe('# Hello\n\n這是測試內容');
      });
    });

    it('應預填摘要', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const input = screen.getByLabelText('摘要') as HTMLTextAreaElement;
        expect(input.value).toBe('測試摘要');
      });
    });

    it('應預填分類', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const select = screen.getByLabelText('分類') as HTMLSelectElement;
        expect(select.value).toBe('cat-1');
      });
    });

    it('應預填狀態', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        const select = screen.getByLabelText('狀態') as HTMLSelectElement;
        expect(select.value).toBe('DRAFT');
      });
    });
  });

  describe('更新提交', () => {
    it('修改標題後可提交更新', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('標題')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('標題') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '更新後的標題');

      await user.click(screen.getByText('儲存'));

      await waitFor(() => {
        const putCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            typeof call[0] === 'string' &&
            call[0].includes('/api/admin/posts/post-1') &&
            call[1]?.method === 'PUT'
        );
        expect(putCalls.length).toBe(1);
        const body = JSON.parse(putCalls[0][1]?.body as string);
        expect(body.title).toBe('更新後的標題');
      });
    });

    it('更新成功應導向文章列表', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('儲存')).toBeInTheDocument();
      });

      await user.click(screen.getByText('儲存'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/posts');
      });
    });
  });

  describe('刪除', () => {
    it('應顯示刪除按鈕', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('刪除')).toBeInTheDocument();
      });
    });

    it('點擊刪除應顯示確認 modal', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('刪除')).toBeInTheDocument();
      });

      await user.click(screen.getByText('刪除'));

      expect(screen.getByText('刪除確認')).toBeInTheDocument();
      expect(screen.getByText(/確定要刪除此文章嗎/)).toBeInTheDocument();
    });

    it('確認刪除應呼叫 DELETE API', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('刪除')).toBeInTheDocument();
      });

      await user.click(screen.getByText('刪除'));
      await user.click(screen.getByText('確定刪除'));

      await waitFor(() => {
        const deleteCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            typeof call[0] === 'string' &&
            call[0].includes('/api/admin/posts/post-1') &&
            call[1]?.method === 'DELETE'
        );
        expect(deleteCalls.length).toBe(1);
      });
    });

    it('刪除成功應導向文章列表', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('刪除')).toBeInTheDocument();
      });

      await user.click(screen.getByText('刪除'));
      await user.click(screen.getByText('確定刪除'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/posts');
      });
    });
  });

  describe('版本歷史', () => {
    it('應顯示版本歷史按鈕', async () => {
      setupFetchResponses();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('版本歷史')).toBeInTheDocument();
      });
    });

    it('點擊版本歷史應導航到版本頁', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<EditPostPage />);

      await waitFor(() => {
        expect(screen.getByText('版本歷史')).toBeInTheDocument();
      });

      await user.click(screen.getByText('版本歷史'));
      expect(mockPush).toHaveBeenCalledWith('/admin/posts/post-1/versions');
    });
  });
});
