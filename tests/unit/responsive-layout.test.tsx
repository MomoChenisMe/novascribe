/**
 * @file 響應式佈局測試
 * @description 驗證響應式佈局功能：
 *   - 5.7 桌面固定側邊欄、平板收合、手機漢堡選單
 *   - 由於 jsdom 不支援實際 viewport 變更，測試 CSS class 與互動行為
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-auth/react
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn(),
}));

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

import AdminLayout from '@/app/(admin)/admin/layout';
import { Sidebar } from '@/components/admin/Sidebar';

describe('5.7 響應式佈局測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'admin@example.com', name: 'Admin' },
        expires: '2099-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });
    mockUsePathname.mockReturnValue('/admin');
  });

  describe('桌面模式（lg+）', () => {
    it('側邊欄容器應有桌面可見的 CSS class', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      const nav = screen.getByRole('navigation', { name: /側邊欄/i });
      const sidebarContainer = nav.closest('[data-testid="sidebar-desktop"]') ||
        nav.closest('aside');
      // 桌面側邊欄應存在於 DOM
      expect(sidebarContainer).toBeInTheDocument();
    });

    it('側邊欄預設應為展開狀態', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      // 展開時應有「收合側邊欄」按鈕
      expect(
        screen.getByRole('button', { name: /收合側邊欄/i })
      ).toBeInTheDocument();
    });

    it('點擊收合按鈕後應切換為收合狀態', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      fireEvent.click(
        screen.getByRole('button', { name: /收合側邊欄/i })
      );

      expect(
        screen.getByRole('button', { name: /展開側邊欄/i })
      ).toBeInTheDocument();
    });
  });

  describe('手機模式漢堡選單', () => {
    it('應渲染漢堡選單按鈕', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      expect(
        screen.getByRole('button', { name: /開啟選單/i })
      ).toBeInTheDocument();
    });

    it('漢堡選單按鈕應有 md:hidden class（手機專用）', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      const menuButton = screen.getByRole('button', { name: /開啟選單/i });
      expect(menuButton.className).toMatch(/md:hidden/);
    });

    it('點擊漢堡選單應顯示行動版側邊欄', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      // 點擊漢堡選單
      fireEvent.click(
        screen.getByRole('button', { name: /開啟選單/i })
      );

      // 應出現行動版 overlay
      expect(screen.getByTestId('mobile-sidebar-overlay')).toBeInTheDocument();
    });

    it('點擊 overlay 背景應關閉行動版側邊欄', () => {
      render(
        <AdminLayout>
          <div>內容</div>
        </AdminLayout>
      );

      // 開啟
      fireEvent.click(
        screen.getByRole('button', { name: /開啟選單/i })
      );
      expect(screen.getByTestId('mobile-sidebar-overlay')).toBeInTheDocument();

      // 點擊背景關閉
      fireEvent.click(screen.getByTestId('mobile-sidebar-overlay'));

      expect(
        screen.queryByTestId('mobile-sidebar-overlay')
      ).not.toBeInTheDocument();
    });
  });

  describe('側邊欄收合狀態', () => {
    it('收合時文字標籤應不可見', () => {
      render(<Sidebar collapsed={true} onToggle={jest.fn()} />);

      // 收合模式下，文字標籤都應有 sr-only class
      const labels = screen.getAllByText('儀表板');
      const visibleLabels = labels.filter(
        (el) => !el.classList.contains('sr-only')
      );
      expect(visibleLabels).toHaveLength(0);
    });

    it('展開時文字標籤應可見', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(screen.getByText('儀表板')).toBeVisible();
    });
  });
});
