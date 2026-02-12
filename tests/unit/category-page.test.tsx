/**
 * @file 分類管理頁面元件測試
 * @description 測試分類管理頁面的 UI 互動
 *   - 列表渲染：樹狀分類顯示
 *   - 新增表單：表單 modal 開關、提交
 *   - 編輯表單：預填資料、更新提交
 *   - 刪除確認：確認 modal、刪除操作
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriesPage from '@/app/(admin)/admin/categories/page';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Mock 樹狀分類資料 */
const mockTreeData = [
  {
    id: 'cat-1',
    name: '技術',
    slug: 'tech',
    parentId: null,
    sortOrder: 0,
    children: [
      {
        id: 'cat-2',
        name: '前端',
        slug: 'frontend',
        parentId: 'cat-1',
        sortOrder: 0,
        children: [],
      },
    ],
  },
  {
    id: 'cat-3',
    name: '生活',
    slug: 'life',
    parentId: null,
    sortOrder: 1,
    children: [],
  },
];

/** Mock 扁平分類資料 */
const mockFlatData = [
  { id: 'cat-1', name: '技術', slug: 'tech', parentId: null, sortOrder: 0 },
  { id: 'cat-2', name: '前端', slug: 'frontend', parentId: 'cat-1', sortOrder: 0 },
  { id: 'cat-3', name: '生活', slug: 'life', parentId: null, sortOrder: 1 },
];

/** 設定 fetch 回傳資料 */
function setupFetchResponses() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('tree=true')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockTreeData }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockFlatData }),
    });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupFetchResponses();
});

// ===== 列表渲染 =====
describe('分類列表渲染', () => {
  it('應顯示頁面標題', async () => {
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('分類管理')).toBeInTheDocument();
    });
  });

  it('應顯示分類名稱', async () => {
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
      expect(screen.getByText('前端')).toBeInTheDocument();
      expect(screen.getByText('生活')).toBeInTheDocument();
    });
  });

  it('應顯示新增按鈕', async () => {
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('新增分類')).toBeInTheDocument();
    });
  });

  it('應在載入中顯示載入狀態', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // 永不 resolve
    render(<CategoriesPage />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('應在載入失敗時顯示錯誤訊息', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/載入失敗/)).toBeInTheDocument();
    });
  });

  it('無分類時應顯示空狀態', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    );

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/尚無分類/)).toBeInTheDocument();
    });
  });
});

// ===== 新增表單 =====
describe('新增分類表單', () => {
  it('點擊新增按鈕應顯示表單 modal', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('新增分類')).toBeInTheDocument();
    });

    await user.click(screen.getByText('新增分類'));

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
              data: { id: 'new-cat', name: '新分類', slug: 'new-cat' },
            }),
        });
      }
      if (url.includes('tree=true')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTreeData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFlatData }),
      });
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('新增分類')).toBeInTheDocument();
    });

    await user.click(screen.getByText('新增分類'));

    await user.type(screen.getByLabelText('名稱'), '新分類');
    await user.type(screen.getByLabelText('Slug'), 'new-cat');

    await user.click(screen.getByText('儲存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/categories',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

// ===== 編輯表單 =====
describe('編輯分類表單', () => {
  it('點擊編輯按鈕應顯示預填的表單', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編輯');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText('名稱')).toHaveValue('技術');
      expect(screen.getByLabelText('Slug')).toHaveValue('tech');
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
              data: { id: 'cat-1', name: '科技', slug: 'tech' },
            }),
        });
      }
      if (url.includes('tree=true')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTreeData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFlatData }),
      });
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編輯');
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText('名稱');
    await user.clear(nameInput);
    await user.type(nameInput, '科技');

    await user.click(screen.getByText('儲存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/categories/cat-1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });
});

// ===== 刪除確認 =====
describe('刪除分類', () => {
  it('點擊刪除按鈕應顯示確認 modal', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
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
      if (url.includes('tree=true')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTreeData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFlatData }),
      });
    });

    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('刪除');
    await user.click(deleteButtons[0]);

    await user.click(screen.getByText('確定刪除'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/categories/cat-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('取消刪除應關閉 modal', async () => {
    const user = userEvent.setup();
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('技術')).toBeInTheDocument();
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
