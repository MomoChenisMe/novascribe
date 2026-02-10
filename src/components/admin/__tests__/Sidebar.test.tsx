/**
 * @file Sidebar 元件測試
 * @description 測試 Sidebar 導航連結和評論管理 badge
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '../Sidebar';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin'),
}));

describe('Sidebar', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('導航連結', () => {
    it('應顯示所有基本導航項目', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={0} />
      );

      expect(screen.getByRole('link', { name: /儀表板/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /文章/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /分類/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /標籤/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /媒體/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /SEO/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /設定/i })).toBeInTheDocument();
    });

    it('應顯示「評論管理」連結', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={0} />
      );

      const commentsLink = screen.getByRole('link', { name: /評論管理/i });
      expect(commentsLink).toBeInTheDocument();
      expect(commentsLink).toHaveAttribute('href', '/admin/comments');
    });
  });

  describe('待審核數 Badge', () => {
    it('當 pendingCount 為 0 時不應顯示 badge', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={0} />
      );

      // Badge 應該不存在
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('當 pendingCount > 0 時應顯示 badge', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={5} />
      );

      // Badge 應該顯示數字
      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500'); // 應該有紅色背景
    });

    it('應顯示大於 99 的數字為 99+', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={150} />
      );

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('在收合模式下也應顯示 badge', () => {
      render(
        <Sidebar collapsed={true} onToggle={mockOnToggle} pendingCount={3} />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('導航連結順序', () => {
    it('「評論管理」應該在「媒體」和「SEO」之間', () => {
      render(
        <Sidebar collapsed={false} onToggle={mockOnToggle} pendingCount={0} />
      );

      const links = screen.getAllByRole('link');
      const linkTexts = links.map((link) => link.textContent);

      const mediaIndex = linkTexts.findIndex((text) => text?.includes('媒體'));
      const commentsIndex = linkTexts.findIndex((text) =>
        text?.includes('評論管理')
      );
      const seoIndex = linkTexts.findIndex((text) => text?.includes('SEO'));

      expect(mediaIndex).toBeLessThan(commentsIndex);
      expect(commentsIndex).toBeLessThan(seoIndex);
    });
  });
});
