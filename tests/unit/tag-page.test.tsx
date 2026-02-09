/**
 * @file 標籤管理頁面元件測試
 * @description 測試標籤管理頁面的 UI 互動
 *   - 列表渲染：標籤名稱、slug、使用次數顯示
 *   - 搜尋：搜尋框輸入觸發查詢
 *   - 排序：點擊表頭切換排序
 *   - 新增表單：表單 modal 開關、提交
 *   - 編輯表單：預填資料、更新提交
 *   - 刪除確認：確認 modal、刪除操作
 *   - 清理未使用標籤：確認 modal、清理操作
 *   - 分頁控制
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsPage from '@/app/(admin)/admin/tags/page';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Mock 標籤資料 */
const mockTagsData = [
  {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    postCount: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-2',
    name: 'TypeScript',
    slug: 'typescript',
    postCount: 3,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'tag-3',
    name: 'React',
    slug: 'react',
    postCount: 0,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
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

/** 設定 fetch 回傳資料 */
function setupFetchResponses() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/admin/tags')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTagsData,
            meta: mockPaginationMeta,
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupFetchResponses();
});

// ===== 列表渲染 =====
describe('標籤列表渲染', () => {
  it('應顯示頁面標題', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('標籤管理')).toBeInTheDocument();
    });
  });

  it('應顯示標籤名稱', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('應顯示標籤 slug', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
    });
  });

  it('應顯示使用次數', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('應顯示新增按鈕', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('新增標籤')).toBeInTheDocument();
    });
  });

  it('應顯示清理未使用標籤按鈕', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('清理未使用標籤')).toBeInTheDocument();
    });
  });

  it('應在載入中顯示載入狀態', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // 永不 resolve
    render(<TagsPage />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('應在載入失敗時顯示錯誤訊息', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText(/載入失敗/)).toBeInTheDocument();
    });
  });

  it('無標籤時應顯示空狀態', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [],
            meta: { ...mockPaginationMeta, total: 0, totalPages: 0 },
          }),
      })
    );

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText(/尚無標籤/)).toBeInTheDocument();
    });
  });
});

// ===== 搜尋 =====
describe('搜尋功能', () => {
  it('應顯示搜尋框', async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/搜尋標籤/)).toBeInTheDocument();
    });
  });

  it('搜尋輸入應觸發查詢', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/搜尋標籤/);
    await user.type(searchInput, 'java');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=java')
      );
    });
  });
});

// ===== 新增表單 =====
describe('新增標籤表單', () => {
  it('點擊新增按鈕應顯示表單 modal', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('新增標籤')).toBeInTheDocument();
    });

    await user.click(screen.getByText('新增標籤'));

    expect(screen.getByLabelText('名稱')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
  });

  it('應能提交新增表單', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { id: 'new-tag', name: 'Vue', slug: 'vue' },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTagsData,
            meta: mockPaginationMeta,
          }),
      });
    });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('新增標籤')).toBeInTheDocument();
    });

    await user.click(screen.getByText('新增標籤'));

    await user.type(screen.getByLabelText('名稱'), 'Vue');
    await user.type(screen.getByLabelText('Slug'), 'vue');

    await user.click(screen.getByText('儲存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/tags',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

// ===== 編輯表單 =====
describe('編輯標籤表單', () => {
  it('點擊編輯按鈕應顯示預填的表單', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編輯');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText('名稱')).toHaveValue('JavaScript');
      expect(screen.getByLabelText('Slug')).toHaveValue('javascript');
    });
  });

  it('應能提交編輯表單', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { id: 'tag-1', name: 'JS', slug: 'javascript' },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTagsData,
            meta: mockPaginationMeta,
          }),
      });
    });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編輯');
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText('名稱');
    await user.clear(nameInput);
    await user.type(nameInput, 'JS');

    await user.click(screen.getByText('儲存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/tags/tag-1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });
});

// ===== 刪除確認 =====
describe('刪除標籤', () => {
  it('點擊刪除按鈕應顯示確認 modal', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('刪除');
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/確定要刪除/)).toBeInTheDocument();
  });

  it('確認刪除應發送 DELETE 請求', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTagsData,
            meta: mockPaginationMeta,
          }),
      });
    });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('刪除');
    await user.click(deleteButtons[0]);

    await user.click(screen.getByText('確定刪除'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/tags/tag-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('取消刪除應關閉 modal', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('刪除');
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/確定要刪除/)).toBeInTheDocument();

    await user.click(screen.getByText('取消'));

    await waitFor(() => {
      expect(screen.queryByText(/確定要刪除/)).not.toBeInTheDocument();
    });
  });
});

// ===== 清理未使用標籤 =====
describe('清理未使用標籤', () => {
  it('點擊清理按鈕應顯示確認 modal', async () => {
    const user = userEvent.setup();
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('清理未使用標籤')).toBeInTheDocument();
    });

    await user.click(screen.getByText('清理未使用標籤'));

    expect(screen.getByText(/確定要清理/)).toBeInTheDocument();
  });

  it('確認清理應發送 DELETE 請求到 /unused', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/unused') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, deletedCount: 2 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTagsData,
            meta: mockPaginationMeta,
          }),
      });
    });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('清理未使用標籤')).toBeInTheDocument();
    });

    await user.click(screen.getByText('清理未使用標籤'));
    await user.click(screen.getByText('確定清理'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/tags/unused',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
