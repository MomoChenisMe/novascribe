/**
 * @file 後台首頁測試（舊版 → 新儀表板）
 * @description 驗證後台首頁功能：
 *   - 新版儀表板：統計數據、快速操作、近期活動
 *   - 替代舊版歡迎訊息 + 系統資訊
 *
 * 注意：詳細測試在 dashboard-page.test.tsx，此檔案保留基本驗證
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

import AdminDashboardPage from '@/app/(admin)/admin/page';

/** Mock 統計數據 */
const mockStats = {
  totalPosts: 10,
  publishedPosts: 5,
  draftPosts: 3,
  scheduledPosts: 1,
  totalCategories: 4,
  totalTags: 6,
  totalMedia: 8,
  recentPostsCount: 2,
};

/** Mock 活動資料 */
const mockActivities = [
  {
    id: 'post-created-1',
    type: 'post_created',
    title: '測試文章',
    description: '建立了文章「測試文章」',
    timestamp: '2024-06-15T10:00:00.000Z',
  },
];

function setupFetch() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/admin/dashboard/stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStats }),
      });
    }
    if (url.includes('/api/admin/dashboard/activity')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockActivities }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

describe('5.9 後台首頁測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupFetch();
  });

  describe('儀表板頁面', () => {
    it('session 載入中時應顯示載入狀態', () => {
      // 讓 fetch 永不回應
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<AdminDashboardPage />);

      expect(screen.getByText(/載入中/i)).toBeInTheDocument();
    });
  });

  describe('統計卡片', () => {
    it('應以卡片形式呈現統計數據', async () => {
      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  describe('卡片佈局', () => {
    it('應有頁面標題', async () => {
      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument();
      });
    });

    it('應顯示儀表板標題', async () => {
      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('儀表板')).toBeInTheDocument();
      });
    });
  });
});
