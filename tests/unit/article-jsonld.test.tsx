/**
 * @file ArticleJsonLd 元件單元測試
 * @description 測試文章結構化資料元件
 *   - 完整欄位輸出
 *   - 無圖片時省略 image
 *   - JSON-LD 格式正確性
 *   - @type 為 BlogPosting
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';

function getJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script) return null;
  return JSON.parse(script.textContent || '');
}

describe('ArticleJsonLd', () => {
  const defaultProps = {
    title: '學習 Next.js 完整指南',
    description: '這是一篇關於 Next.js 的教學文章',
    url: 'https://blog.example.com/posts/nextjs-guide',
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2025-01-20T00:00:00Z',
    authorName: 'Momo',
    image: 'https://blog.example.com/images/nextjs.jpg',
  };

  it('應渲染 script tag with type application/ld+json', () => {
    const { container } = render(<ArticleJsonLd {...defaultProps} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('JSON-LD @context 應為 https://schema.org', () => {
    const { container } = render(<ArticleJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data['@context']).toBe('https://schema.org');
  });

  it('JSON-LD @type 應為 BlogPosting', () => {
    const { container } = render(<ArticleJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data['@type']).toBe('BlogPosting');
  });

  it('應包含完整欄位', () => {
    const { container } = render(<ArticleJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data.headline).toBe('學習 Next.js 完整指南');
    expect(data.description).toBe('這是一篇關於 Next.js 的教學文章');
    expect(data.url).toBe('https://blog.example.com/posts/nextjs-guide');
    expect(data.datePublished).toBe('2025-01-15T00:00:00Z');
    expect(data.dateModified).toBe('2025-01-20T00:00:00Z');
    expect(data.image).toBe('https://blog.example.com/images/nextjs.jpg');
    expect(data.author).toEqual({
      '@type': 'Person',
      name: 'Momo',
    });
  });

  it('無圖片時應省略 image 欄位', () => {
    const { image: _, ...propsWithoutImage } = defaultProps;
    const { container } = render(<ArticleJsonLd {...propsWithoutImage} />);
    const data = getJsonLd(container);

    expect(data.image).toBeUndefined();
  });

  it('無 dateModified 時應省略該欄位', () => {
    const { dateModified: _, ...propsWithout } = defaultProps;
    const { container } = render(<ArticleJsonLd {...propsWithout} />);
    const data = getJsonLd(container);

    expect(data.dateModified).toBeUndefined();
  });

  it('無 description 時應省略該欄位', () => {
    const { description: _, ...propsWithout } = defaultProps;
    const { container } = render(<ArticleJsonLd {...propsWithout} />);
    const data = getJsonLd(container);

    expect(data.description).toBeUndefined();
  });

  it('應包含 publisher 資訊', () => {
    const { container } = render(<ArticleJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data.publisher).toBeDefined();
    expect(data.publisher['@type']).toBe('Organization');
  });
});
