import { render, screen } from '@testing-library/react';
import ArticleCard from '../ArticleCard';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockArticle = {
  id: '1',
  title: 'React 入門指南',
  slug: 'react-intro',
  excerpt: '這是一篇介紹 React 基礎概念的文章',
  featuredImage: '/images/react-intro.jpg',
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
};

describe('ArticleCard', () => {
  it('應該渲染文章標題', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('React 入門指南')).toBeInTheDocument();
  });

  it('應該渲染文章摘要', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('這是一篇介紹 React 基礎概念的文章')).toBeInTheDocument();
  });

  it('應該渲染封面圖', () => {
    render(<ArticleCard article={mockArticle} />);
    const image = screen.getByAltText('React 入門指南');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('react-intro.jpg'));
  });

  it('沒有封面圖時應該顯示預設圖片', () => {
    const articleWithoutImage = { ...mockArticle, featuredImage: null };
    render(<ArticleCard article={articleWithoutImage} />);
    const image = screen.getByAltText('React 入門指南');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  it('應該渲染發布日期', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/2024-01-15|2024年1月15日/i)).toBeInTheDocument();
  });

  it('應該渲染閱讀時間', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/5 分鐘|5分鐘/i)).toBeInTheDocument();
  });

  it('應該渲染分類', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('前端開發')).toBeInTheDocument();
  });

  it('分類應該是連結', () => {
    render(<ArticleCard article={mockArticle} />);
    const categoryLink = screen.getByText('前端開發').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/categories/frontend');
  });

  it('應該渲染標籤', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('標籤應該是連結', () => {
    render(<ArticleCard article={mockArticle} />);
    const reactTag = screen.getByText('React').closest('a');
    expect(reactTag).toHaveAttribute('href', '/tags/react');
  });

  it('整個卡片應該可以點擊連到文章頁', () => {
    render(<ArticleCard article={mockArticle} />);
    const articleLink = screen.getByText('React 入門指南').closest('a');
    expect(articleLink).toHaveAttribute('href', '/posts/react-intro');
  });

  it('沒有標籤時不應該渲染標籤區域', () => {
    const articleWithoutTags = { ...mockArticle, tags: [] };
    render(<ArticleCard article={articleWithoutTags} />);
    expect(screen.queryByText('React')).toBeNull();
  });

  it('沒有分類時不應該渲染分類', () => {
    const articleWithoutCategory = { ...mockArticle, category: null };
    render(<ArticleCard article={articleWithoutCategory} />);
    expect(screen.queryByText('前端開發')).toBeNull();
  });
});
