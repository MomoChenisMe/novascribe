/**
 * @file 儀表板頁面元件測試
 * @description 測試後台儀表板頁面的 UI 渲染
 *   - 統計卡片：各項統計數據渲染
 *   - 近期活動時間線：活動描述與時間
 *   - 快速操作捷徑：導航連結
 *   - 載入狀態與錯誤處理
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardPage from '@/app/(admin)/admin/page';

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

/** Mock 統計數據 */
const mockStats = {
  totalPosts: 25,
  publishedPosts: 15,
  draftPosts: 5,
  scheduledPosts: 3,
  totalCategories: 8,
  totalTags: 12,
  totalMedia: 30,
  recentPostsCount: 4,
};

/** Mock 活動資料 */
const mockActivities = [
  {
    id: 'post-created-1',
    type: 'post_created',
    title: '新文章',
    description: '建立了文章「新文章」',
    timestamp: '2024-06-15T10:00:00.000Z',
  },
  {
    id: 'category-created-1',
    type: 'category_created',
    title: '技術',
    description: '建立了分類「技術」',
    timestamp: '2024-06-15T09:00:00.000Z',
  },
  {
    id: 'tag-created-1',
    type: 'tag_created',
    title: 'React',
    description: '建立了標籤「React」',
    timestamp: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'media-uploaded-1',
    type: 'media_uploaded',
    title: 'photo.jpg',
    description: '上傳了媒體「photo.jpg」',
    timestamp: '2024-06-15T07:00:00.000Z',
  },
];

/** 設定 fetch 回傳資料 */
function setupFetchResponses(overrides?: {
  stats?: Partial<typeof mockStats>;
  activities?: typeof mockActivities;
  statsFail?: boolean;
  activityFail?: boolean;
}) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/admin/dashboard/stats')) {
      if (overrides?.statsFail) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({ success: false, error: 'Server error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { ...mockStats, ...overrides?.stats },
          }),
      });
    }
    if (url.includes('/api/admin/dashboard/activity')) {
      if (overrides?.activityFail) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({ success: false, error: 'Server error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: overrides?.activities ?? mockActivities,
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

// ===== 統計卡片渲染 =====
describe('統計卡片', () => {
  it('應顯示頁面標題', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('儀表板')).toBeInTheDocument();
    });
  });

  it('應顯示文章總數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('應顯示已發佈文章數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('應顯示分類總數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('應顯示標籤總數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('應顯示媒體總數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  it('應顯示近 7 天新增文章數', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('應向 stats API 發送請求', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard/stats')
      );
    });
  });
});

// ===== 活動時間線 =====
describe('近期活動時間線', () => {
  it('應顯示活動描述', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/建立了文章「新文章」/)).toBeInTheDocument();
      expect(screen.getByText(/建立了分類「技術」/)).toBeInTheDocument();
      expect(screen.getByText(/建立了標籤「React」/)).toBeInTheDocument();
      expect(screen.getByText(/上傳了媒體「photo.jpg」/)).toBeInTheDocument();
    });
  });

  it('應向 activity API 發送請求', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard/activity')
      );
    });
  });

  it('無活動時應顯示提示訊息', async () => {
    setupFetchResponses({ activities: [] });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('暫無近期活動')).toBeInTheDocument();
    });
  });
});

// ===== 快速操作捷徑 =====
describe('快速操作捷徑', () => {
  it('應顯示新增文章連結', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /新增文章/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/admin/posts/new');
    });
  });

  it('應顯示管理分類連結', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /管理分類/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/admin/categories');
    });
  });

  it('應顯示管理標籤連結', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /管理標籤/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/admin/tags');
    });
  });

  it('應顯示媒體庫連結', async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /媒體庫/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/admin/media');
    });
  });
});

// ===== 載入狀態 =====
describe('載入與錯誤狀態', () => {
  it('載入中應顯示載入提示', () => {
    // 讓 fetch 永遠不回應以保持載入狀態
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<AdminDashboardPage />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('stats API 失敗時不應崩潰', async () => {
    setupFetchResponses({ statsFail: true });

    render(<AdminDashboardPage />);

    // 頁面應仍然渲染
    await waitFor(() => {
      expect(screen.getByText('儀表板')).toBeInTheDocument();
    });
  });

  it('activity API 失敗時不應崩潰', async () => {
    setupFetchResponses({ activityFail: true });

    render(<AdminDashboardPage />);

    // 頁面應仍然渲染
    await waitFor(() => {
      expect(screen.getByText('儀表板')).toBeInTheDocument();
    });
  });
});
