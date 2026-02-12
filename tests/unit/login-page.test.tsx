/**
 * @file 登入頁面元件測試
 * @description 驗證登入頁面功能：
 *   - 4.1 表單渲染、欄位驗證、錯誤訊息顯示、載入狀態
 *   - 4.3 登入成功導向至 /admin
 *   - 4.4 已登入使用者存取登入頁自動導向 /admin
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-auth/react
const mockSignIn = jest.fn();
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

import LoginPage from '@/app/(admin)/login/page';

describe('4.1 登入頁面元件測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  describe('表單渲染', () => {
    it('應渲染登入表單標題', () => {
      render(<LoginPage />);
      expect(
        screen.getByRole('heading', { name: /登入/i })
      ).toBeInTheDocument();
    });

    it('應渲染 email 輸入欄位', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    });

    it('應渲染密碼輸入欄位', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/密碼/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密碼/i)).toHaveAttribute(
        'type',
        'password'
      );
    });

    it('應渲染登入按鈕', () => {
      render(<LoginPage />);
      expect(
        screen.getByRole('button', { name: /登入/i })
      ).toBeInTheDocument();
    });
  });

  describe('欄位驗證', () => {
    it('提交空表單時應顯示 email 錯誤訊息', async () => {
      render(<LoginPage />);
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(screen.getByText(/請輸入 email/i)).toBeInTheDocument();
      });
    });

    it('email 格式錯誤時應顯示錯誤訊息', async () => {
      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(screen.getByText(/請輸入有效的 email/i)).toBeInTheDocument();
      });
    });

    it('密碼為空時應顯示錯誤訊息', async () => {
      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(screen.getByText(/請輸入密碼/i)).toBeInTheDocument();
      });
    });

    it('驗證通過時不應顯示欄位錯誤訊息', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(screen.queryByText(/請輸入 email/i)).not.toBeInTheDocument();
        expect(
          screen.queryByText(/請輸入有效的 email/i)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/請輸入密碼/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('錯誤訊息顯示', () => {
    it('登入失敗時應顯示錯誤訊息', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
      });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'wrong-password' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/帳號或密碼錯誤/i)
        ).toBeInTheDocument();
      });
    });

    it('登入被速率限制時應顯示相應錯誤', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'RATE_LIMITED',
      });

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/登入嘗試次數過多/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('載入狀態', () => {
    it('提交時按鈕應顯示載入狀態', async () => {
      // 讓 signIn 保持 pending
      mockSignIn.mockReturnValue(new Promise(() => {}));

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent(/登入中/i);
      });
    });

    it('提交時 email 和密碼欄位應被禁用', async () => {
      mockSignIn.mockReturnValue(new Promise(() => {}));

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/密碼/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /登入/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/密碼/i)).toBeDisabled();
      });
    });
  });
});

describe('4.3 登入成功導向測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('登入成功後應呼叫 signIn 並重新導向至 /admin', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/密碼/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登入/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('signIn 使用 redirect: false 避免自動跳轉', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/密碼/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登入/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({ redirect: false })
      );
    });
  });
});

describe('4.4 已登入使用者存取登入頁測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('已登入使用者應自動導向至 /admin', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'admin@example.com', name: 'Admin' },
        expires: '2099-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('session 載入中時不應導向', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<LoginPage />);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('未登入使用者不應自動導向', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<LoginPage />);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
