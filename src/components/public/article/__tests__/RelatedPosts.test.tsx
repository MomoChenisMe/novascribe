import { render, screen } from '@testing-library/react';
import RelatedPosts from '../RelatedPosts';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockRelatedPosts = [
  {
    id: '1',
    title: 'React Hooks 完整指南',
    slug: 'react-hooks-guide',
    excerpt: '深入了解 React Hooks 的使用方式',
    publishedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'TypeScript 最佳實踐',
    slug: 'typescript-best-practices',
    excerpt: 'TypeScript 開發的最佳實踐與技巧',
    publishedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Next.js 14 新功能介紹',
    slug: 'nextjs-14-features',
    excerpt: '探索 Next.js 14 帶來的新特性',
    publishedAt: new Date('2024-01-14'),
  },
];

describe('RelatedPosts', () => {
  it('應該渲染標題', () => {
    render(<RelatedPosts posts={mockRelatedPosts} />);
    expect(screen.getByText('相關文章')).toBeInTheDocument();
  });

  it('應該渲染所有相關文章標題', () => {
    render(<RelatedPosts posts={mockRelatedPosts} />);
    expect(screen.getByText('React Hooks 完整指南')).toBeInTheDocument();
    expect(screen.getByText('TypeScript 最佳實踐')).toBeInTheDocument();
    expect(screen.getByText('Next.js 14 新功能介紹')).toBeInTheDocument();
  });

  it('應該渲染文章摘要', () => {
    render(<RelatedPosts posts={mockRelatedPosts} />);
    expect(screen.getByText('深入了解 React Hooks 的使用方式')).toBeInTheDocument();
  });

  it('文章標題應該是連結', () => {
    render(<RelatedPosts posts={mockRelatedPosts} />);
    const link = screen.getByText('React Hooks 完整指南').closest('a');
    expect(link).toHaveAttribute('href', '/posts/react-hooks-guide');
  });

  it('應該渲染發布日期', () => {
    render(<RelatedPosts posts={mockRelatedPosts} />);
    expect(screen.getByText(/2024-01-10|2024年1月10日/i)).toBeInTheDocument();
  });

  it('空列表時不應該渲染', () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.querySelector('section')).toBeEmptyDOMElement();
  });

  it('應該使用 semantic HTML section 標籤', () => {
    const { container } = render(<RelatedPosts posts={mockRelatedPosts} />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('應該有適當的間距樣式', () => {
    const { container } = render(<RelatedPosts posts={mockRelatedPosts} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('mt-12');
  });

  it('應該限制顯示數量（最多 3 篇）', () => {
    const manyPosts = [
      ...mockRelatedPosts,
      {
        id: '4',
        title: '第四篇文章',
        slug: 'post-4',
        excerpt: '摘要',
        publishedAt: new Date(),
      },
      {
        id: '5',
        title: '第五篇文章',
        slug: 'post-5',
        excerpt: '摘要',
        publishedAt: new Date(),
      },
    ];
    render(<RelatedPosts posts={manyPosts.slice(0, 3)} />);
    expect(screen.queryByText('第四篇文章')).toBeNull();
  });

  it('每篇文章應該使用 article 標籤', () => {
    const { container } = render(<RelatedPosts posts={mockRelatedPosts} />);
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(3);
  });
});
