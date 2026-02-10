import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock ThemeToggle
jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Toggle Theme</button>;
  };
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Header', () => {
  it('應該渲染 Logo', () => {
    render(<Header />);
    expect(screen.getByText('NovaScribe')).toBeInTheDocument();
  });

  it('應該渲染導航連結', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /首頁/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /分類/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /標籤/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /關於/i })).toBeInTheDocument();
  });

  it('應該渲染搜尋入口', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText(/搜尋文章/i)).toBeInTheDocument();
  });

  it('應該渲染 Dark mode 切換按鈕', () => {
    render(<Header />);
    const toggleButtons = screen.getAllByTestId('theme-toggle');
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it('應該在手機版顯示漢堡選單按鈕', () => {
    render(<Header />);
    const mobileMenuButton = screen.getByLabelText(/開啟選單/i);
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('點擊漢堡選單應該切換導航顯示', () => {
    render(<Header />);
    const mobileMenuButton = screen.getByLabelText(/開啟選單/i);
    
    // 初始狀態：導航隱藏（手機版）
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('hidden', 'md:flex');
    
    // 點擊開啟
    fireEvent.click(mobileMenuButton);
    expect(nav).toHaveClass('flex');
    
    // 點擊關閉
    fireEvent.click(mobileMenuButton);
    expect(nav).toHaveClass('hidden', 'md:flex');
  });

  it('搜尋框應該導航到搜尋頁', () => {
    render(<Header />);
    const searchInput = screen.getByPlaceholderText(/搜尋文章/i);
    const searchForm = searchInput.closest('form');
    
    expect(searchForm).toHaveAttribute('action', '/search');
    expect(searchForm).toHaveAttribute('method', 'get');
  });

  it('Logo 應該連結到首頁', () => {
    render(<Header />);
    const logo = screen.getByText('NovaScribe').closest('a');
    expect(logo).toHaveAttribute('href', '/');
  });

  it('導航連結應該有正確的 href', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /首頁/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /分類/i })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: /標籤/i })).toHaveAttribute('href', '/tags');
    expect(screen.getByRole('link', { name: /關於/i })).toHaveAttribute('href', '/about');
  });
});
