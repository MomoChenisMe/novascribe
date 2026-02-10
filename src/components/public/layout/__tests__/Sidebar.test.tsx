import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockCategories = [
  { id: '1', name: '前端開發', slug: 'frontend', _count: { posts: 10 } },
  { id: '2', name: '後端開發', slug: 'backend', _count: { posts: 5 } },
];

const mockTags = [
  { id: '1', name: 'React', slug: 'react', _count: { posts: 8 } },
  { id: '2', name: 'TypeScript', slug: 'typescript', _count: { posts: 12 } },
  { id: '3', name: 'Next.js', slug: 'nextjs', _count: { posts: 6 } },
];

const mockPopularPosts = [
  { id: '1', title: '熱門文章 1', slug: 'popular-1' },
  { id: '2', title: '熱門文章 2', slug: 'popular-2' },
  { id: '3', title: '熱門文章 3', slug: 'popular-3' },
];

describe('Sidebar', () => {
  it('應該渲染分類列表標題', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('分類')).toBeInTheDocument();
  });

  it('應該渲染所有分類', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('前端開發')).toBeInTheDocument();
    expect(screen.getByText('後端開發')).toBeInTheDocument();
  });

  it('分類應該顯示文章數', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('(10)')).toBeInTheDocument();
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });

  it('分類連結應該有正確的 href', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    const frontendLink = screen.getByText('前端開發').closest('a');
    expect(frontendLink).toHaveAttribute('href', '/categories/frontend');
  });

  it('應該渲染標籤雲標題', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('標籤')).toBeInTheDocument();
  });

  it('應該渲染所有標籤', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });

  it('標籤連結應該有正確的 href', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    const reactLink = screen.getByText('React').closest('a');
    expect(reactLink).toHaveAttribute('href', '/tags/react');
  });

  it('應該渲染熱門文章標題', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('熱門文章')).toBeInTheDocument();
  });

  it('應該渲染所有熱門文章', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('熱門文章 1')).toBeInTheDocument();
    expect(screen.getByText('熱門文章 2')).toBeInTheDocument();
    expect(screen.getByText('熱門文章 3')).toBeInTheDocument();
  });

  it('熱門文章連結應該有正確的 href', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={mockPopularPosts} />);
    const post1Link = screen.getByText('熱門文章 1').closest('a');
    expect(post1Link).toHaveAttribute('href', '/posts/popular-1');
  });

  it('空分類列表時應該顯示訊息', () => {
    render(<Sidebar categories={[]} tags={mockTags} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('暫無分類')).toBeInTheDocument();
  });

  it('空標籤列表時應該顯示訊息', () => {
    render(<Sidebar categories={mockCategories} tags={[]} popularPosts={mockPopularPosts} />);
    expect(screen.getByText('暫無標籤')).toBeInTheDocument();
  });

  it('空熱門文章時應該顯示訊息', () => {
    render(<Sidebar categories={mockCategories} tags={mockTags} popularPosts={[]} />);
    expect(screen.getByText('暫無熱門文章')).toBeInTheDocument();
  });
});
