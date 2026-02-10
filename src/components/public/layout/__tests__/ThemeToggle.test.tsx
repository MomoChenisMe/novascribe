'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '@/components/public/layout/ThemeToggle';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
};

describe('ThemeToggle 元件', () => {
  beforeEach(() => {
    // 清理 localStorage 和 DOM
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    // 預設 mock light mode
    mockMatchMedia(false);
  });

  describe('切換按鈕', () => {
    it('應該渲染主題切換按鈕', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('點擊按鈕應該切換主題', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      // 初始為 light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // 點擊切換為 dark
      fireEvent.click(button);
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // 再次點擊切換回 light
      fireEvent.click(button);
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });
  });

  describe('localStorage 持久化', () => {
    it('應該將主題偏好存入 localStorage', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      fireEvent.click(button);
      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('dark');
      });

      fireEvent.click(button);
      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('light');
      });
    });

    it('應該從 localStorage 讀取初始主題', () => {
      localStorage.setItem('theme', 'dark');
      render(<ThemeToggle />);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('系統偏好偵測', () => {
    it('無 localStorage 時應該使用系統偏好', () => {
      // 模擬系統 dark mode
      mockMatchMedia(true);

      render(<ThemeToggle />);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
