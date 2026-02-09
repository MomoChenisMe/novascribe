/**
 * @file MetaTags 元件單元測試
 * @description 測試 OG 和 Twitter Card meta tags 元件
 *   - OG tags（og:title, og:description, og:image, og:url, og:type）
 *   - Twitter Card tags（twitter:card, twitter:title, twitter:description, twitter:image）
 *   - 預設值邏輯
 *
 * 注意：React 19 會自動將 <meta> tags 提升到 <head>，
 *       因此需要從 document.head 查詢。
 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MetaTags } from '@/components/seo/MetaTags';

function getMetaContent(property: string): string | null {
  const meta = document.head.querySelector(
    `meta[property="${property}"], meta[name="${property}"]`
  );
  return meta?.getAttribute('content') || null;
}

function hasMetaTag(attr: string, value: string): boolean {
  return document.head.querySelector(`meta[${attr}="${value}"]`) !== null;
}

describe('MetaTags', () => {
  const defaultProps = {
    title: '測試文章標題',
    description: '測試文章描述',
    url: 'https://blog.example.com/posts/test',
    image: 'https://blog.example.com/images/test.jpg',
  };

  afterEach(() => {
    cleanup();
    // 清除 head 中的 meta tags
    document.head
      .querySelectorAll('meta[property], meta[name^="twitter:"]')
      .forEach((el) => el.remove());
  });

  describe('OG Tags', () => {
    it('應渲染 og:title', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('og:title')).toBe('測試文章標題');
    });

    it('應渲染 og:description', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('og:description')).toBe('測試文章描述');
    });

    it('應渲染 og:image', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('og:image')).toBe(
        'https://blog.example.com/images/test.jpg'
      );
    });

    it('應渲染 og:url', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('og:url')).toBe(
        'https://blog.example.com/posts/test'
      );
    });

    it('應渲染 og:type 為 article', () => {
      render(<MetaTags {...defaultProps} type="article" />);
      expect(getMetaContent('og:type')).toBe('article');
    });

    it('預設 og:type 為 website', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('og:type')).toBe('website');
    });
  });

  describe('Twitter Card Tags', () => {
    it('應渲染 twitter:card', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('twitter:card')).toBe('summary_large_image');
    });

    it('應渲染 twitter:title', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('twitter:title')).toBe('測試文章標題');
    });

    it('應渲染 twitter:description', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('twitter:description')).toBe('測試文章描述');
    });

    it('應渲染 twitter:image', () => {
      render(<MetaTags {...defaultProps} />);
      expect(getMetaContent('twitter:image')).toBe(
        'https://blog.example.com/images/test.jpg'
      );
    });

    it('自訂 twitterCard 類型', () => {
      render(<MetaTags {...defaultProps} twitterCard="summary" />);
      expect(getMetaContent('twitter:card')).toBe('summary');
    });

    it('設定 twitterHandle 時應渲染 twitter:site', () => {
      render(<MetaTags {...defaultProps} twitterHandle="@momo" />);
      expect(getMetaContent('twitter:site')).toBe('@momo');
    });
  });

  describe('預設值邏輯', () => {
    it('無 image 時不應渲染 og:image 和 twitter:image', () => {
      const { image: _, ...props } = defaultProps;
      render(<MetaTags {...props} />);

      expect(hasMetaTag('property', 'og:image')).toBe(false);
      expect(hasMetaTag('name', 'twitter:image')).toBe(false);
    });

    it('無 description 時不應渲染 og:description 和 twitter:description', () => {
      const { description: _, ...props } = defaultProps;
      render(<MetaTags {...props} />);

      expect(hasMetaTag('property', 'og:description')).toBe(false);
      expect(hasMetaTag('name', 'twitter:description')).toBe(false);
    });

    it('無 twitterHandle 時不應渲染 twitter:site', () => {
      render(<MetaTags {...defaultProps} />);
      expect(hasMetaTag('name', 'twitter:site')).toBe(false);
    });

    it('有 siteName 時應渲染 og:site_name', () => {
      render(<MetaTags {...defaultProps} siteName="NovaScribe" />);
      expect(getMetaContent('og:site_name')).toBe('NovaScribe');
    });
  });
});
