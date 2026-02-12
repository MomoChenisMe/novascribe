/**
 * @file 登出功能測試
 * @description 驗證登出功能：
 *   - 4.6 登出按鈕元件、清除 session、導向登入頁
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-auth/react
const mockSignOut = jest.fn();
jest.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

import { LogoutButton } from '@/components/admin/LogoutButton';

describe('4.6 登出功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應渲染登出按鈕', () => {
    render(<LogoutButton />);
    expect(
      screen.getByRole('button', { name: /登出/i })
    ).toBeInTheDocument();
  });

  it('點擊登出按鈕應呼叫 signOut', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /登出/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        callbackUrl: '/login',
      });
    });
  });

  it('signOut 應指定 callbackUrl 為 /login', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /登出/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith(
        expect.objectContaining({ callbackUrl: '/login' })
      );
    });
  });

  it('登出期間按鈕應顯示載入狀態', async () => {
    mockSignOut.mockReturnValue(new Promise(() => {}));

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /登出/i }));

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
