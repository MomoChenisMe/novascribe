/**
 * @file 版本歷史頁面元件測試
 * @description 測試版本歷史頁面的 UI 互動
 *   - 版本列表渲染
 *   - 版本內容預覽
 *   - 回溯按鈕 → 確認 modal → POST API
 *   - 載入失敗顯示錯誤
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostVersionsPage from '@/app/(admin)/admin/posts/[id]/versions/page';

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

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockVersions = [
  {
    id: 'ver-1',
    postId: 'post-1',
    title: '第一版標題',
    content: '# 第一版\n\n這是第一版的內容',
    excerpt: '第一版摘要',
    versionNumber: 1,
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'ver-2',
    postId: 'post-1',
    title: '第二版標題',
    content: '# 第二版\n\n這是第二版的內容，有修改',
    excerpt: '第二版摘要',
    versionNumber: 2,
    createdAt: '2024-01-16T12:00:00.000Z',
  },
  {
    id: 'ver-3',
    postId: 'post-1',
    title: '第三版標題',
    content: '# 第三版\n\n這是最新版本的內容',
    excerpt: '第三版摘要',
    versionNumber: 3,
    createdAt: '2024-01-17T14:30:00.000Z',
  },
];

/** 設定 fetch 回傳資料 */
function setupFetchResponses(overrides?: { versions?: typeof mockVersions | null }) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : '';

    // 版本列表
    if (
      urlStr.includes('/api/admin/posts/post-1/versions') &&
      !urlStr.includes('/restore') &&
      (!options || !options.method || options.method === 'GET')
    ) {
      const versions = overrides?.versions !== undefined ? overrides.versions : mockVersions;
      if (versions === null) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({ success: false, error: '載入失敗' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: versions }),
      });
    }

    // 回溯版本
    if (urlStr.includes('/restore') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

describe('版本歷史頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('載入狀態', () => {
    it('載入時應顯示「載入中...」', () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      render(<PostVersionsPage />);
      expect(screen.getByText('載入中...')).toBeInTheDocument();
    });

    it('載入失敗應顯示錯誤', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText('載入失敗')).toBeInTheDocument();
      });
    });
  });

  describe('版本列表渲染', () => {
    it('應顯示頁面標題', async () => {
      setupFetchResponses();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText('版本歷史')).toBeInTheDocument();
      });
    });

    it('應顯示所有版本', async () => {
      setupFetchResponses();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
        expect(screen.getByText(/第二版標題/)).toBeInTheDocument();
        expect(screen.getByText(/第三版標題/)).toBeInTheDocument();
      });
    });

    it('應顯示版本號', async () => {
      setupFetchResponses();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/版本 1/)).toBeInTheDocument();
        expect(screen.getByText(/版本 2/)).toBeInTheDocument();
        expect(screen.getByText(/版本 3/)).toBeInTheDocument();
      });
    });

    it('無版本時應顯示提示', async () => {
      setupFetchResponses({ versions: [] });
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText('尚無版本記錄')).toBeInTheDocument();
      });
    });
  });

  describe('版本內容預覽', () => {
    it('點擊版本應展開內容預覽', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText(/這是第一版的內容/)).toBeInTheDocument();
      });
    });

    it('再次點擊應收合預覽', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      // 展開
      await user.click(screen.getByText(/第一版標題/));
      await waitFor(() => {
        expect(screen.getByText(/這是第一版的內容/)).toBeInTheDocument();
      });

      // 收合
      await user.click(screen.getByText(/第一版標題/));
      await waitFor(() => {
        expect(screen.queryByText(/這是第一版的內容/)).not.toBeInTheDocument();
      });
    });
  });

  describe('回溯操作', () => {
    it('展開版本後應顯示回溯按鈕', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText('回溯到此版本')).toBeInTheDocument();
      });
    });

    it('點擊回溯按鈕應顯示確認 modal', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText('回溯到此版本')).toBeInTheDocument();
      });

      await user.click(screen.getByText('回溯到此版本'));

      expect(screen.getByText('回溯確認')).toBeInTheDocument();
      expect(screen.getByText(/確定要回溯到此版本嗎/)).toBeInTheDocument();
    });

    it('確認回溯應呼叫 POST API', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText('回溯到此版本')).toBeInTheDocument();
      });

      await user.click(screen.getByText('回溯到此版本'));
      await user.click(screen.getByText('確定回溯'));

      await waitFor(() => {
        const restoreCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            typeof call[0] === 'string' &&
            call[0].includes('/api/admin/posts/post-1/versions/ver-1/restore') &&
            call[1]?.method === 'POST'
        );
        expect(restoreCalls.length).toBe(1);
      });
    });

    it('回溯成功應導回編輯頁', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText('回溯到此版本')).toBeInTheDocument();
      });

      await user.click(screen.getByText('回溯到此版本'));
      await user.click(screen.getByText('確定回溯'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/posts/post-1/edit');
      });
    });

    it('取消回溯應關閉 modal', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/第一版標題/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/第一版標題/));

      await waitFor(() => {
        expect(screen.getByText('回溯到此版本')).toBeInTheDocument();
      });

      await user.click(screen.getByText('回溯到此版本'));
      expect(screen.getByText('回溯確認')).toBeInTheDocument();

      await user.click(screen.getByText('取消'));
      expect(screen.queryByText('回溯確認')).not.toBeInTheDocument();
    });
  });

  describe('導覽', () => {
    it('應顯示返回編輯頁按鈕', async () => {
      setupFetchResponses();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText('返回編輯')).toBeInTheDocument();
      });
    });

    it('點擊返回編輯頁應導航', async () => {
      setupFetchResponses();
      const user = userEvent.setup();
      render(<PostVersionsPage />);

      await waitFor(() => {
        expect(screen.getByText('返回編輯')).toBeInTheDocument();
      });

      await user.click(screen.getByText('返回編輯'));
      expect(mockPush).toHaveBeenCalledWith('/admin/posts/post-1/edit');
    });
  });
});
