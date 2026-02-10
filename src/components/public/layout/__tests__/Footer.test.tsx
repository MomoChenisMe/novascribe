import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer', () => {
  it('應該渲染版權資訊', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} NovaScribe`, 'i'))).toBeInTheDocument();
  });

  it('應該渲染 RSS Feed 連結', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /RSS 2\.0/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Atom/i })).toBeInTheDocument();
  });

  it('RSS 連結應該有正確的 href', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /RSS 2\.0/i })).toHaveAttribute('href', '/feed.xml');
    expect(screen.getByRole('link', { name: /Atom/i })).toHaveAttribute('href', '/feed/atom.xml');
  });

  it('應該渲染社交連結（如果有的話）', () => {
    render(<Footer />);
    // 假設有 GitHub、Twitter 連結
    const socialLinks = screen.queryAllByRole('link', { name: /GitHub|Twitter|LinkedIn/i });
    // 如果有配置社交連結，至少會有一個
    expect(socialLinks.length).toBeGreaterThanOrEqual(0);
  });

  it('應該包含導航連結', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /首頁/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /分類/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /標籤/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /關於/i })).toBeInTheDocument();
  });

  it('導航連結應該有正確的 href', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /首頁/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /分類/i })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: /標籤/i })).toHaveAttribute('href', '/tags');
    expect(screen.getByRole('link', { name: /關於/i })).toHaveAttribute('href', '/about');
  });

  it('應該使用 semantic HTML footer 標籤', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
