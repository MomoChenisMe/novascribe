/**
 * ArticleCard 元件測試
 */

import { render, screen } from '@testing-library/react';
import ArticleCard from '@/components/public/ArticleCard';

describe('ArticleCard 元件', () => {
  const mockPost = {
    title: 'Next.js 14 新功能解析',
    excerpt: '探索 Next.js 14 帶來的嶄新特性與效能優化，包含 Server Actions、Partial Prerendering 等重要更新。',
    coverImage: '/images/nextjs-14.jpg',
    slug: 'nextjs-14-features',
    publishedAt: '2024-02-11T00:00:00.000Z',
    category: {
      name: '前端技術',
      slug: 'frontend',
    },
  };

  it('應該渲染文章標題', () => {
    render(<ArticleCard post={mockPost} />);
    
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
  });

  it('應該渲染文章摘要', () => {
    render(<ArticleCard post={mockPost} />);
    
    expect(screen.getByText(mockPost.excerpt)).toBeInTheDocument();
  });

  it('應該渲染分類標籤', () => {
    render(<ArticleCard post={mockPost} />);
    
    expect(screen.getByText(mockPost.category.name)).toBeInTheDocument();
  });

  it('應該以 YYYY-MM-DD 格式顯示日期', () => {
    render(<ArticleCard post={mockPost} />);
    
    expect(screen.getByText('2024-02-11')).toBeInTheDocument();
  });

  it('應該渲染縮圖圖片', () => {
    render(<ArticleCard post={mockPost} />);
    
    const img = screen.getByAltText(mockPost.title);
    expect(img).toBeInTheDocument();
  });

  it('應該包含連結至文章詳情頁', () => {
    render(<ArticleCard post={mockPost} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/posts/${mockPost.slug}`);
  });

  it('應該正確設定 time 元素的 dateTime 屬性', () => {
    render(<ArticleCard post={mockPost} />);
    
    const timeElement = screen.getByText('2024-02-11');
    expect(timeElement).toHaveAttribute('dateTime', mockPost.publishedAt);
  });

  it('標題應該使用 text-xl font-semibold 樣式', () => {
    render(<ArticleCard post={mockPost} />);
    
    const title = screen.getByText(mockPost.title);
    expect(title).toHaveClass('text-xl', 'font-semibold');
  });

  it('摘要應該使用 line-clamp-2 樣式', () => {
    render(<ArticleCard post={mockPost} />);
    
    const excerpt = screen.getByText(mockPost.excerpt);
    expect(excerpt).toHaveClass('line-clamp-2');
  });

  it('應該包含 Card 元件的 hover 效果', () => {
    const { container } = render(<ArticleCard post={mockPost} />);
    
    const card = container.querySelector('.hover\\:shadow-md');
    expect(card).toBeInTheDocument();
  });

  it('縮圖應該使用 16:9 比例', () => {
    const { container } = render(<ArticleCard post={mockPost} />);
    
    const imageWrapper = container.querySelector('.aspect-video');
    expect(imageWrapper).toBeInTheDocument();
  });

  it('應該正確處理空白摘要', () => {
    const postWithoutExcerpt = {
      ...mockPost,
      excerpt: '',
    };
    
    render(<ArticleCard post={postWithoutExcerpt} />);
    
    const excerpt = screen.queryByText(mockPost.excerpt);
    expect(excerpt).not.toBeInTheDocument();
  });

  it('應該渲染 Tag 元件作為分類', () => {
    const { container } = render(<ArticleCard post={mockPost} />);
    
    // Tag 元件使用 rounded-full 樣式
    const tag = container.querySelector('.rounded-full');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveTextContent(mockPost.category.name);
  });
});
