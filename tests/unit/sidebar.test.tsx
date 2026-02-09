/**
 * @file 側邊欄元件測試
 * @description 驗證側邊欄功能：
 *   - 5.3 導覽項目渲染、當前頁面高亮、收合/展開
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

import { Sidebar } from '@/components/admin/Sidebar';

describe('5.3 側邊欄元件測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/admin');
  });

  describe('導覽項目渲染', () => {
    it('應渲染所有導覽項目', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(screen.getByText('儀表板')).toBeInTheDocument();
      expect(screen.getByText('文章')).toBeInTheDocument();
      expect(screen.getByText('分類')).toBeInTheDocument();
      expect(screen.getByText('標籤')).toBeInTheDocument();
      expect(screen.getByText('媒體')).toBeInTheDocument();
      expect(screen.getByText('SEO')).toBeInTheDocument();
      expect(screen.getByText('設定')).toBeInTheDocument();
    });

    it('每個導覽項目應為連結', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(7);
    });

    it('導覽項目應連結至正確路徑', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(screen.getByText('儀表板').closest('a')).toHaveAttribute(
        'href',
        '/admin'
      );
      expect(screen.getByText('文章').closest('a')).toHaveAttribute(
        'href',
        '/admin/posts'
      );
      expect(screen.getByText('分類').closest('a')).toHaveAttribute(
        'href',
        '/admin/categories'
      );
      expect(screen.getByText('標籤').closest('a')).toHaveAttribute(
        'href',
        '/admin/tags'
      );
      expect(screen.getByText('媒體').closest('a')).toHaveAttribute(
        'href',
        '/admin/media'
      );
      expect(screen.getByText('SEO').closest('a')).toHaveAttribute(
        'href',
        '/admin/seo'
      );
      expect(screen.getByText('設定').closest('a')).toHaveAttribute(
        'href',
        '/admin/settings'
      );
    });

    it('應渲染 navigation landmark', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(
        screen.getByRole('navigation', { name: /側邊欄/i })
      ).toBeInTheDocument();
    });
  });

  describe('當前頁面高亮', () => {
    it('當前路徑 /admin 時，儀表板應有高亮樣式', () => {
      mockUsePathname.mockReturnValue('/admin');
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      const dashboardLink = screen.getByText('儀表板').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('當前路徑 /admin/posts 時，文章應有高亮樣式', () => {
      mockUsePathname.mockReturnValue('/admin/posts');
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      const postsLink = screen.getByText('文章').closest('a');
      expect(postsLink).toHaveAttribute('aria-current', 'page');
    });

    it('非當前頁面不應有高亮標記', () => {
      mockUsePathname.mockReturnValue('/admin');
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      const postsLink = screen.getByText('文章').closest('a');
      expect(postsLink).not.toHaveAttribute('aria-current');
    });

    it('子路徑應匹配父導覽項目', () => {
      mockUsePathname.mockReturnValue('/admin/posts/123');
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      const postsLink = screen.getByText('文章').closest('a');
      expect(postsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('收合/展開', () => {
    it('展開時應顯示文字標籤', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(screen.getByText('儀表板')).toBeVisible();
      expect(screen.getByText('文章')).toBeVisible();
    });

    it('收合時應隱藏文字標籤', () => {
      render(<Sidebar collapsed={true} onToggle={jest.fn()} />);

      // 收合時文字應有 sr-only class（仍在 DOM 但對視覺隱藏）
      const labels = screen.getAllByText('儀表板');
      const visibleLabel = labels.find(
        (el) => !el.classList.contains('sr-only')
      );
      // 在收合模式下，文字標籤應有隱藏的 class
      expect(visibleLabel).toBeUndefined();
    });

    it('應有收合/展開切換按鈕', () => {
      render(<Sidebar collapsed={false} onToggle={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: /收合側邊欄|展開側邊欄/i })
      ).toBeInTheDocument();
    });

    it('點擊切換按鈕應呼叫 onToggle', () => {
      const mockOnToggle = jest.fn();
      render(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

      fireEvent.click(
        screen.getByRole('button', { name: /收合側邊欄/i })
      );

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('收合狀態下按鈕文字應為「展開側邊欄」', () => {
      render(<Sidebar collapsed={true} onToggle={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: /展開側邊欄/i })
      ).toBeInTheDocument();
    });
  });
});
