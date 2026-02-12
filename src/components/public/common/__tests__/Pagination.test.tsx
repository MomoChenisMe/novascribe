import { render, screen } from '@testing-library/react';
import Pagination from '../Pagination';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  };
});

describe('Pagination', () => {
  it('應該渲染當前頁碼', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('應該渲染總頁數資訊', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
    expect(screen.getByText(/共 5 頁/i)).toBeInTheDocument();
  });

  it('應該渲染上一頁按鈕', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
    expect(screen.getByText('上一頁')).toBeInTheDocument();
  });

  it('應該渲染下一頁按鈕', () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
    expect(screen.getByText('下一頁')).toBeInTheDocument();
  });

  it('第一頁時上一頁按鈕應該禁用', () => {
    render(<Pagination currentPage={1} totalPages={5} basePath="/posts" />);
    const prevButton = screen.getByText('上一頁').closest('a');
    expect(prevButton?.className).toContain('pointer-events-none');
    expect(prevButton?.className).toContain('opacity-50');
  });

  it('最後一頁時下一頁按鈕應該禁用', () => {
    render(<Pagination currentPage={5} totalPages={5} basePath="/posts" />);
    const nextButton = screen.getByText('下一頁').closest('a');
    expect(nextButton?.className).toContain('pointer-events-none');
    expect(nextButton?.className).toContain('opacity-50');
  });

  it('上一頁按鈕應該連結到前一頁', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
    const prevButton = screen.getByText('上一頁').closest('a');
    expect(prevButton).toHaveAttribute('href', '/posts?page=2');
  });

  it('下一頁按鈕應該連結到後一頁', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
    const nextButton = screen.getByText('下一頁').closest('a');
    expect(nextButton).toHaveAttribute('href', '/posts?page=4');
  });

  it('應該渲染頁碼按鈕', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('當前頁碼應該有特殊樣式', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
    const currentPageButton = screen.getByText('3').closest('a');
    expect(currentPageButton?.className).toContain('bg-primary');
    expect(currentPageButton?.className).toContain('text-white');
  });

  it('頁碼按鈕應該有正確的連結', () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/posts" />);
    const page2Button = screen.getByText('2').closest('a');
    expect(page2Button).toHaveAttribute('href', '/posts?page=2');
  });

  it('總頁數為 1 時不應該渲染分頁', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} basePath="/posts" />);
    expect(container.querySelector('nav')).toBeEmptyDOMElement();
  });

  it('頁數過多時應該顯示省略符號', () => {
    render(<Pagination currentPage={5} totalPages={10} basePath="/posts" />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('應該使用 semantic HTML nav 標籤', () => {
    const { container } = render(<Pagination currentPage={2} totalPages={5} basePath="/posts" />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
