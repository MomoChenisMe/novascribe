/**
 * Pagination 元件測試
 */

import { render, screen } from '@testing-library/react';
import Pagination from '@/components/public/Pagination';

describe('Pagination 元件', () => {
  describe('基本渲染', () => {
    it('應該在總頁數為 1 時不渲染任何內容', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('應該在總頁數 > 1 時渲染導航', () => {
      render(<Pagination currentPage={1} totalPages={3} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('應該渲染上一頁按鈕', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      expect(screen.getByLabelText('上一頁')).toBeInTheDocument();
    });

    it('應該渲染下一頁按鈕', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      expect(screen.getByLabelText('下一頁')).toBeInTheDocument();
    });
  });

  describe('頁碼按鈕', () => {
    it('應該顯示所有頁碼當總頁數 <= 5', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      expect(screen.getByLabelText('第 1 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 2 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 3 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 4 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 5 頁')).toBeInTheDocument();
    });

    it('應該在總頁數 > 5 時顯示省略符號', () => {
      render(<Pagination currentPage={1} totalPages={10} />);
      
      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('應該正確高亮當前頁', () => {
      render(<Pagination currentPage={3} totalPages={5} />);
      
      const currentPageButton = screen.getByLabelText('第 3 頁');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
      expect(currentPageButton).toHaveClass('bg-[var(--color-primary)]');
    });

    it('非當前頁應該使用白色背景', () => {
      render(<Pagination currentPage={3} totalPages={5} />);
      
      const page1Button = screen.getByLabelText('第 1 頁');
      expect(page1Button).not.toHaveAttribute('aria-current');
      expect(page1Button).toHaveClass('bg-white');
    });
  });

  describe('上一頁按鈕', () => {
    it('應該在第一頁時禁用上一頁按鈕', () => {
      render(<Pagination currentPage={1} totalPages={5} />);
      
      const prevButton = screen.getByText('← 上一頁').closest('span');
      expect(prevButton).toHaveAttribute('aria-disabled', 'true');
      expect(prevButton).toHaveClass('cursor-not-allowed');
    });

    it('應該在非第一頁時啟用上一頁按鈕', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      const prevButton = screen.getByLabelText('上一頁');
      expect(prevButton).not.toHaveAttribute('aria-disabled');
      expect(prevButton).toHaveAttribute('href');
    });

    it('上一頁按鈕應該連結至前一頁', () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
      
      const prevButton = screen.getByLabelText('上一頁');
      expect(prevButton).toHaveAttribute('href', '/posts?page=2');
    });

    it('從第 2 頁的上一頁應該連結至首頁', () => {
      render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
      
      const prevButton = screen.getByLabelText('上一頁');
      expect(prevButton).toHaveAttribute('href', '/posts');
    });
  });

  describe('下一頁按鈕', () => {
    it('應該在最後一頁時禁用下一頁按鈕', () => {
      render(<Pagination currentPage={5} totalPages={5} />);
      
      const nextButton = screen.getByText('下一頁 →').closest('span');
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
      expect(nextButton).toHaveClass('cursor-not-allowed');
    });

    it('應該在非最後一頁時啟用下一頁按鈕', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      const nextButton = screen.getByLabelText('下一頁');
      expect(nextButton).not.toHaveAttribute('aria-disabled');
      expect(nextButton).toHaveAttribute('href');
    });

    it('下一頁按鈕應該連結至後一頁', () => {
      render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
      
      const nextButton = screen.getByLabelText('下一頁');
      expect(nextButton).toHaveAttribute('href', '/posts?page=3');
    });
  });

  describe('URL 生成', () => {
    it('第 1 頁應該使用 basePath 作為 URL', () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
      
      const page1Button = screen.getByLabelText('第 1 頁');
      expect(page1Button).toHaveAttribute('href', '/posts');
    });

    it('其他頁應該包含 page 查詢參數', () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/posts" />);
      
      const page2Button = screen.getByLabelText('第 2 頁');
      expect(page2Button).toHaveAttribute('href', '/posts?page=2');
    });

    it('basePath 預設為空字串時，第 1 頁應該為 /', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      const page1Button = screen.getByLabelText('第 1 頁');
      expect(page1Button).toHaveAttribute('href', '/');
    });
  });

  describe('響應式設計', () => {
    it('應該在桌面版顯示頁碼按鈕', () => {
      const { container } = render(
        <Pagination currentPage={2} totalPages={5} />
      );
      
      const desktopPageNumbers = container.querySelector('.hidden.sm\\:flex');
      expect(desktopPageNumbers).toBeInTheDocument();
    });

    it('應該在行動版顯示當前頁/總頁數', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
    });
  });

  describe('智能頁碼顯示', () => {
    it('當在開頭時應該顯示: 1 2 3 4 ... 10', () => {
      render(<Pagination currentPage={2} totalPages={10} />);
      
      expect(screen.getByLabelText('第 1 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 2 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 3 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 4 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 10 頁')).toBeInTheDocument();
    });

    it('當在中間時應該顯示: 1 ... 4 5 6 ... 10', () => {
      render(<Pagination currentPage={5} totalPages={10} />);
      
      expect(screen.getByLabelText('第 1 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 4 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 5 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 6 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 10 頁')).toBeInTheDocument();
    });

    it('當在結尾時應該顯示: 1 ... 7 8 9 10', () => {
      render(<Pagination currentPage={9} totalPages={10} />);
      
      expect(screen.getByLabelText('第 1 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 7 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 8 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 9 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 10 頁')).toBeInTheDocument();
    });
  });

  describe('無障礙功能', () => {
    it('應該包含 navigation role', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('應該包含 aria-label', () => {
      render(<Pagination currentPage={2} totalPages={5} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', '分頁導航');
    });

    it('每個頁碼按鈕應該有 aria-label', () => {
      render(<Pagination currentPage={2} totalPages={3} />);
      
      expect(screen.getByLabelText('第 1 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 2 頁')).toBeInTheDocument();
      expect(screen.getByLabelText('第 3 頁')).toBeInTheDocument();
    });
  });
});
