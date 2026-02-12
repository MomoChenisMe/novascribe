/**
 * @file 媒體管理頁面元件測試
 * @description 測試媒體管理頁面的 UI 互動
 *   - 圖片網格渲染：縮圖、檔名、大小、上傳時間
 *   - 上傳區域：拖放、點擊選擇、上傳中狀態
 *   - 刪除確認 modal
 *   - 分頁控制
 *   - 空狀態、載入狀態、錯誤狀態
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaPage from '@/app/(admin)/admin/media/page';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

/** Mock 媒體資料 */
const mockMediaData = [
  {
    id: 'media-1',
    filename: 'photo-001.webp',
    mimeType: 'image/webp',
    size: 102400,
    url: '/uploads/photo-001.webp',
    thumbnailUrl: '/uploads/photo-001-thumb.webp',
    uploadedBy: 'user-1',
    createdAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'media-2',
    filename: 'banner-002.webp',
    mimeType: 'image/webp',
    size: 2048000,
    url: '/uploads/banner-002.webp',
    thumbnailUrl: '/uploads/banner-002-thumb.webp',
    uploadedBy: 'user-1',
    createdAt: '2024-01-16T14:00:00.000Z',
  },
];

const mockPaginationMeta = {
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

/** 設定 fetch 回傳 */
function setupFetchResponses(overrides?: {
  data?: typeof mockMediaData;
  meta?: typeof mockPaginationMeta;
}) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    if (url.includes('/api/admin/media') && (!options || options.method !== 'POST' && options.method !== 'DELETE')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: overrides?.data ?? mockMediaData,
            meta: overrides?.meta ?? mockPaginationMeta,
          }),
      });
    }
    // POST / DELETE
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });
  });
}

describe('媒體管理頁面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('載入狀態', () => {
    it('載入時應顯示「載入中...」', () => {
      mockFetch.mockReturnValue(new Promise(() => {})); // 永不 resolve
      render(<MediaPage />);
      expect(screen.getByText('載入中...')).toBeInTheDocument();
    });
  });

  describe('圖片網格', () => {
    it('應渲染媒體列表', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
        expect(screen.getByText('banner-002.webp')).toBeInTheDocument();
      });
    });

    it('應顯示檔案大小', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('100.0 KB')).toBeInTheDocument();
        expect(screen.getByText('2.0 MB')).toBeInTheDocument();
      });
    });

    it('應顯示縮圖', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute(
          'src',
          '/uploads/photo-001-thumb.webp'
        );
      });
    });

    it('空列表應顯示「尚無媒體」', async () => {
      setupFetchResponses({ data: [], meta: { ...mockPaginationMeta, total: 0, totalPages: 0 } });
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('尚無媒體')).toBeInTheDocument();
      });
    });
  });

  describe('上傳區域', () => {
    it('應顯示上傳提示文字', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(
          screen.getByText('拖放圖片至此，或點擊選擇檔案')
        ).toBeInTheDocument();
      });
    });

    it('應包含隱藏的 file input', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.type).toBe('file');
      });
    });

    it('選擇檔案後應呼叫上傳 API', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
      });

      const file = new File(['fake-image'], 'test.png', {
        type: 'image/png',
      });

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      await userEvent.upload(input, file);

      await waitFor(() => {
        // POST 呼叫
        const postCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            call[1]?.method === 'POST'
        );
        expect(postCalls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('刪除確認', () => {
    it('點擊刪除按鈕應顯示確認 modal', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
      });

      // 找到刪除按鈕
      const deleteButtons = screen.getAllByTitle('刪除');
      await userEvent.click(deleteButtons[0]);

      expect(screen.getByText('刪除確認')).toBeInTheDocument();
      expect(
        screen.getByText(/確定要刪除「photo-001.webp」嗎/)
      ).toBeInTheDocument();
    });

    it('確認刪除應呼叫 DELETE API', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('刪除');
      await userEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('確定刪除');
      await userEvent.click(confirmButton);

      await waitFor(() => {
        const deleteCalls = mockFetch.mock.calls.filter(
          (call: [string, RequestInit?]) =>
            call[1]?.method === 'DELETE'
        );
        expect(deleteCalls.length).toBe(1);
        expect(deleteCalls[0][0]).toContain('/api/admin/media/media-1');
      });
    });

    it('取消刪除應關閉 modal', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('刪除');
      await userEvent.click(deleteButtons[0]);

      expect(screen.getByText('刪除確認')).toBeInTheDocument();

      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);

      expect(screen.queryByText('刪除確認')).not.toBeInTheDocument();
    });
  });

  describe('分頁控制', () => {
    it('多頁時應顯示分頁控制', async () => {
      setupFetchResponses({
        meta: {
          total: 50,
          page: 1,
          limit: 20,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('共 50 筆，第 1/3 頁')).toBeInTheDocument();
        expect(screen.getByText('上一頁')).toBeDisabled();
        expect(screen.getByText('下一頁')).not.toBeDisabled();
      });
    });

    it('只有一頁時不應顯示分頁控制', async () => {
      setupFetchResponses();
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('photo-001.webp')).toBeInTheDocument();
      });

      expect(screen.queryByText('上一頁')).not.toBeInTheDocument();
    });

    it('點擊下一頁應更新分頁', async () => {
      setupFetchResponses({
        meta: {
          total: 50,
          page: 1,
          limit: 20,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('下一頁')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('下一頁'));

      await waitFor(() => {
        // 應再次 fetch 帶 page=2
        const fetchCalls = mockFetch.mock.calls.filter(
          (call: [string]) => call[0].includes('page=2')
        );
        expect(fetchCalls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('錯誤處理', () => {
    it('API 錯誤應顯示錯誤訊息', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({ success: false, error: '伺服器錯誤' }),
      });

      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('伺服器錯誤')).toBeInTheDocument();
      });
    });

    it('網路錯誤應顯示「載入失敗」', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<MediaPage />);

      await waitFor(() => {
        expect(screen.getByText('載入失敗')).toBeInTheDocument();
      });
    });
  });
});
