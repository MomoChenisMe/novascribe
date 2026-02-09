/**
 * @file 後台首頁測試
 * @description 驗證後台首頁功能：
 *   - 5.9 歡迎訊息、系統資訊顯示
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next-auth/react
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

import AdminDashboardPage from '@/app/(admin)/admin/page';

describe('5.9 後台首頁測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'admin@example.com', name: 'Admin User' },
        expires: '2099-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });
  });

  describe('歡迎訊息', () => {
    it('應顯示歡迎訊息包含使用者名稱', () => {
      render(<AdminDashboardPage />);

      expect(
        screen.getByText(/歡迎回來，Admin User/i)
      ).toBeInTheDocument();
    });

    it('無名稱時應使用 email 作為歡迎訊息', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@example.com', name: null },
          expires: '2099-01-01T00:00:00.000Z',
        },
        status: 'authenticated',
      });

      render(<AdminDashboardPage />);

      expect(
        screen.getByText(/歡迎回來，admin@example.com/i)
      ).toBeInTheDocument();
    });

    it('session 載入中時應顯示載入狀態', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<AdminDashboardPage />);

      expect(screen.getByText(/載入中/i)).toBeInTheDocument();
    });
  });

  describe('系統資訊', () => {
    it('應顯示系統資訊區塊', () => {
      render(<AdminDashboardPage />);

      expect(screen.getByText('系統資訊')).toBeInTheDocument();
    });

    it('應顯示 Next.js 版本', () => {
      render(<AdminDashboardPage />);

      expect(screen.getByText(/Next\.js/i)).toBeInTheDocument();
    });

    it('應顯示 Node.js 版本', () => {
      render(<AdminDashboardPage />);

      expect(screen.getByText(/Node\.js/i)).toBeInTheDocument();
    });

    it('應顯示 React 版本', () => {
      render(<AdminDashboardPage />);

      expect(screen.getByText(/React/i)).toBeInTheDocument();
    });
  });

  describe('卡片佈局', () => {
    it('系統資訊應以卡片形式呈現', () => {
      render(<AdminDashboardPage />);

      // 系統資訊卡片
      const sysInfoSection = screen.getByText('系統資訊').closest('div');
      expect(sysInfoSection).toBeInTheDocument();
    });

    it('應有頁面標題', () => {
      render(<AdminDashboardPage />);

      expect(
        screen.getByRole('heading', { level: 1 })
      ).toBeInTheDocument();
    });
  });
});
