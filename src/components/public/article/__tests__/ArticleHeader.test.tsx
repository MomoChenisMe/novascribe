import { render, screen } from '@testing-library/react';
import ArticleHeader from '../ArticleHeader';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockArticle = {
  title: 'React 入門指南',
  publishedAt: new Date('2024-01-15'),
  readingTime: 5,
  category: {
    id: 'cat1',
    name: '前端開發',
    slug: 'frontend',
  },
  tags: [
    { tag: { id: 'tag1', name: 'React', slug: 'react' } },
    { tag: { id: 'tag2', name: 'JavaScript', slug: 'javascript' } },
  ],
  author: {
    id: 'author1',
    name: 'Momo',
  },
};

describe('ArticleHeader', () => {
  it('應該渲染文章標題', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByRole('heading', { name: 'React 入門指南' })).toBeInTheDocument();
  });

  it('應該使用 h1 標籤', () => {
    render(<ArticleHeader article={mockArticle} />);
    const heading = screen.getByRole('heading', { name: 'React 入門指南' });
    expect(heading.tagName).toBe('H1');
  });

  it('應該渲染作者名稱', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByText(/Momo/)).toBeInTheDocument();
  });

  it('應該渲染發布日期', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByText(/2024-01-15|2024年1月15日/i)).toBeInTheDocument();
  });

  it('應該渲染閱讀時間', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByText(/5 分鐘|5分鐘/i)).toBeInTheDocument();
  });

  it('應該渲染分類', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByText('前端開發')).toBeInTheDocument();
  });

  it('分類應該是連結', () => {
    render(<ArticleHeader article={mockArticle} />);
    const categoryLink = screen.getByText('前端開發').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/categories/frontend');
  });

  it('應該渲染所有標籤', () => {
    render(<ArticleHeader article={mockArticle} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('標籤應該是連結', () => {
    render(<ArticleHeader article={mockArticle} />);
    const reactTag = screen.getByText('React').closest('a');
    expect(reactTag).toHaveAttribute('href', '/tags/react');
  });

  it('沒有分類時不應該渲染分類', () => {
    const articleWithoutCategory = { ...mockArticle, category: null };
    render(<ArticleHeader article={articleWithoutCategory} />);
    expect(screen.queryByText('前端開發')).toBeNull();
  });

  it('沒有標籤時不應該渲染標籤區域', () => {
    const articleWithoutTags = { ...mockArticle, tags: [] };
    render(<ArticleHeader article={articleWithoutTags} />);
    expect(screen.queryByText('React')).toBeNull();
  });

  it('沒有作者時應該顯示匿名', () => {
    const articleWithoutAuthor = { ...mockArticle, author: null };
    render(<ArticleHeader article={articleWithoutAuthor} />);
    expect(screen.getByText(/匿名/)).toBeInTheDocument();
  });

  it('應該使用 semantic HTML time 標籤', () => {
    const { container } = render(<ArticleHeader article={mockArticle} />);
    const timeElement = container.querySelector('time');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement).toHaveAttribute('datetime', mockArticle.publishedAt.toISOString());
  });
});
