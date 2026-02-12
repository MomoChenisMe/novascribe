/**
 * @file 頂部列元件測試
 * @description 驗證頂部列功能：
 *   - 5.5 使用者資訊顯示、登出按鈕
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next-auth/react
const mockUseSession = jest.fn();
const mockSignOut = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

import { Header } from '@/components/admin/Header';

describe('5.5 頂部列元件測試', () => {
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

  describe('使用者資訊顯示', () => {
    it('應顯示使用者名稱', () => {
      render(<Header onMenuClick={jest.fn()} />);

      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('無名稱時應顯示 email', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', email: 'admin@example.com', name: null },
          expires: '2099-01-01T00:00:00.000Z',
        },
        status: 'authenticated',
      });

      render(<Header onMenuClick={jest.fn()} />);

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('未認證時不應顯示使用者資訊', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<Header onMenuClick={jest.fn()} />);

      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
      expect(
        screen.queryByText('admin@example.com')
      ).not.toBeInTheDocument();
    });
  });

  describe('登出按鈕', () => {
    it('應包含登出按鈕', () => {
      render(<Header onMenuClick={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: /登出/i })
      ).toBeInTheDocument();
    });
  });

  describe('頂部列結構', () => {
    it('應渲染 banner landmark', () => {
      render(<Header onMenuClick={jest.fn()} />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('應顯示應用程式名稱', () => {
      render(<Header onMenuClick={jest.fn()} />);

      expect(screen.getByText('NovaScribe')).toBeInTheDocument();
    });

    it('應包含漢堡選單按鈕', () => {
      render(<Header onMenuClick={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: /開啟選單/i })
      ).toBeInTheDocument();
    });
  });
});
