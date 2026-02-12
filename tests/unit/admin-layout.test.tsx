/**
 * @file 後台佈局元件測試
 * @description 驗證後台佈局功能：
 *   - 5.1 三區域結構（側邊欄、頂部列、主內容區）
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

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

describe('5.1 後台佈局元件測試', () => {
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

  it('應渲染頂部列區域', () => {
    render(
      <AdminLayout>
        <div>測試內容</div>
      </AdminLayout>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('應渲染側邊欄區域', () => {
    render(
      <AdminLayout>
        <div>測試內容</div>
      </AdminLayout>
    );

    expect(
      screen.getByRole('navigation', { name: /側邊欄/i })
    ).toBeInTheDocument();
  });

  it('應渲染主內容區域', () => {
    render(
      <AdminLayout>
        <div>測試內容</div>
      </AdminLayout>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('主內容區應渲染 children', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">子元件內容</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('子元件內容')).toBeInTheDocument();
  });

  it('三個區域應同時存在於佈局中', () => {
    render(
      <AdminLayout>
        <div>測試內容</div>
      </AdminLayout>
    );

    const banner = screen.getByRole('banner');
    const nav = screen.getByRole('navigation', { name: /側邊欄/i });
    const main = screen.getByRole('main');

    expect(banner).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });
});
