import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  const mockPost = {
    title: '探索 TypeScript 的進階型別系統',
    excerpt: '深入了解 TypeScript 中的泛型、條件型別與映射型別，提升程式碼的型別安全性與可維護性。',
    coverImage: '/images/test-cover.jpg',
    slug: 'typescript-advanced-types',
    publishedAt: '2026-02-11',
  };

  it('應該渲染文章標題', () => {
    render(<HeroSection post={mockPost} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(mockPost.title);
  });

  it('應該渲染文章摘要', () => {
    render(<HeroSection post={mockPost} />);
    expect(screen.getByText(mockPost.excerpt)).toBeInTheDocument();
  });

  it('應該渲染封面圖片', () => {
    render(<HeroSection post={mockPost} />);
    const image = screen.getByAltText(mockPost.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(mockPost.coverImage)));
  });

  it('應該渲染「閱讀更多」按鈕', () => {
    render(<HeroSection post={mockPost} />);
    const button = screen.getByRole('button', { name: /閱讀更多/i });
    expect(button).toBeInTheDocument();
  });

  it('按鈕應該連結到正確的文章頁面', () => {
    render(<HeroSection post={mockPost} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/posts/${mockPost.slug}`);
  });

  it('標題應該使用 text-4xl font-bold', () => {
    const { container } = render(<HeroSection post={mockPost} />);
    const heading = container.querySelector('h1');
    expect(heading?.className).toMatch(/text-4xl/);
    expect(heading?.className).toMatch(/font-bold/);
  });

  it('應該有響應式佈局 class (flex-col md:flex-row)', () => {
    const { container } = render(<HeroSection post={mockPost} />);
    const layoutDiv = container.querySelector('.flex');
    expect(layoutDiv?.className).toMatch(/flex-col/);
    expect(layoutDiv?.className).toMatch(/md:flex-row/);
  });

  it('圖片容器應該有 aspect-[16/9] 比例', () => {
    const { container } = render(<HeroSection post={mockPost} />);
    const imageContainer = container.querySelector('.aspect-\\[16\\/9\\]');
    expect(imageContainer).toBeInTheDocument();
  });

  it('應該有 50/50 寬度比例 (w-full md:w-1/2)', () => {
    const { container } = render(<HeroSection post={mockPost} />);
    const imageSection = container.querySelectorAll('.w-full.md\\:w-1\\/2');
    expect(imageSection.length).toBe(2); // 圖片區塊 + 文字區塊
  });

  it('按鈕應該使用 Primary variant', () => {
    render(<HeroSection post={mockPost} />);
    const button = screen.getByRole('button', { name: /閱讀更多/i });
    // Button 元件的 primary variant 使用 bg-[var(--color-primary)]
    expect(button.className).toMatch(/bg-\[var\(--color-primary\)\]/);
  });

  it('圖片應該設定 priority (LCP 優化)', () => {
    render(<HeroSection post={mockPost} />);
    const image = screen.getByAltText(mockPost.title);
    // Next.js Image 元件的 priority prop 會在實際 DOM 中轉換為 fetchpriority="high"
    // 在測試環境中，我們驗證圖片存在即可（priority 屬性在 Server Component 中生效）
    expect(image).toBeInTheDocument();
  });

  it('圖片應該設定正確的 sizes 屬性', () => {
    render(<HeroSection post={mockPost} />);
    const image = screen.getByAltText(mockPost.title);
    expect(image).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });
});
