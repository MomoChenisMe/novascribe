/**
 * @file 新增文章頁面元件測試
 * @description 測試新增文章頁面的 UI 互動
 *   - 表單欄位：標題、slug、內容、摘要、狀態、分類、標籤
 *   - 分類/標籤選擇
 *   - 封面圖片選擇
 *   - 表單提交
 *   - 狀態切換顯示不同欄位（發佈時間、排程時間）
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPostPage from '@/app/(admin)/admin/posts/new/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

// Mock MarkdownEditor（避免 Markdown 渲染複雜性）
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
function setupFetchResponses() {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : '';

    // 分類列表
    if (urlStr.includes('/api/admin/categories')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockCategories }),
      });
    }

    // 標籤列表
    if (urlStr.includes('/api/admin/tags') && (!options || options.method !== 'POST')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockTags, meta: { total: 3 } }),
      });
    }

    // 建立文章
    if (urlStr.includes('/api/admin/posts') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: 'new-post-1', title: 'Test Post' },
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

describe('新增文章頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('表單欄位', () => {
    it('應顯示頁面標題', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('新增文章')).toBeInTheDocument();
      });
    });

    it('應顯示標題輸入框', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('標題')).toBeInTheDocument();
      });
    });

    it('應顯示 Slug 輸入框', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Slug')).toBeInTheDocument();
      });
    });

    it('應顯示 Markdown 編輯器', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      });
    });

    it('應顯示摘要輸入框', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('摘要')).toBeInTheDocument();
      });
    });

    it('應顯示狀態下拉', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('狀態')).toBeInTheDocument();
      });
    });

    it('應顯示儲存和取消按鈕', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('儲存')).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
      });
    });
  });

  describe('分類選擇', () => {
    it('應顯示分類下拉', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('分類')).toBeInTheDocument();
      });
    });

    it('分類下拉應包含「無分類」選項', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        const select = screen.getByLabelText('分類') as HTMLSelectElement;
        const options = Array.from(select.options);
        expect(options.some((o) => o.text === '無分類')).toBe(true);
      });
    });

    it('分類下拉應載入分類列表', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        const select = screen.getByLabelText('分類') as HTMLSelectElement;
        const options = Array.from(select.options);
        expect(options.some((o) => o.text === '技術')).toBe(true);
        expect(options.some((o) => o.text === '生活')).toBe(true);
      });
    });
  });

  describe('標籤選擇', () => {
    it('應顯示標籤選擇區域', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('標籤')).toBeInTheDocument();
      });
    });

    it('應載入可用標籤', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });

    it('點擊標籤可選取/取消', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      const tagButton = screen.getByText('JavaScript');
      await user.click(tagButton);

      // 再次點擊取消選取
      await user.click(tagButton);
    });
  });

  describe('狀態切換', () => {
    it('狀態=SCHEDULED 時應顯示排程時間欄位', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('狀態')).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText('狀態'), 'SCHEDULED');

      expect(screen.getByLabelText('排程時間')).toBeInTheDocument();
    });

    it('狀態=DRAFT 時不應顯示排程時間', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('狀態')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText('排程時間')).not.toBeInTheDocument();
    });
  });

  describe('表單提交', () => {
    it('填寫標題後可提交表單', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('標題')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('標題'), '測試文章');
      await user.type(screen.getByLabelText('Slug'), 'test-article');

      await user.click(screen.getByText('儲存'));

      await waitFor(() => {
        const postCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            typeof call[0] === 'string' &&
            call[0].includes('/api/admin/posts') &&
            !call[0].includes('batch') &&
            call[1]?.method === 'POST'
        );
        expect(postCalls.length).toBe(1);
        const body = JSON.parse(postCalls[0][1]?.body as string);
        expect(body.title).toBe('測試文章');
        expect(body.slug).toBe('test-article');
      });
    });

    it('提交成功應導向文章列表', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('標題')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('標題'), '測試文章');
      await user.type(screen.getByLabelText('Slug'), 'test-article');
      await user.click(screen.getByText('儲存'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/posts');
      });
    });

    it('點擊取消應導回文章列表', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('取消')).toBeInTheDocument();
      });

      await user.click(screen.getByText('取消'));
      expect(mockPush).toHaveBeenCalledWith('/admin/posts');
    });
  });

  describe('封面圖片', () => {
    it('應顯示封面圖片區域', async () => {
      setupFetchResponses();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByText('封面圖片')).toBeInTheDocument();
      });
    });
  });

  describe('Slug 自動生成', () => {
    it('輸入標題時應自動填入 Slug（如果 Slug 為空）', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<NewPostPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('標題')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('標題'), 'Hello World');

      // Slug 應自動填入（小寫、連字號）
      await waitFor(() => {
        const slugInput = screen.getByLabelText('Slug') as HTMLInputElement;
        expect(slugInput.value).toBe('hello-world');
      });
    });
  });
});
