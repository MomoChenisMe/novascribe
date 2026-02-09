/**
 * @file BreadcrumbJsonLd 元件單元測試
 * @description 測試麵包屑導航結構化資料元件
 *   - 有分類路徑（首頁 → 分類 → 文章）
 *   - 無分類（首頁 → 文章）
 *   - 子分類層級
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

function getJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script) return null;
  return JSON.parse(script.textContent || '');
}

describe('BreadcrumbJsonLd', () => {
  const siteUrl = 'https://blog.example.com';

  it('應渲染 script tag with type application/ld+json', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[{ name: '首頁', url: siteUrl }]}
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('JSON-LD @type 應為 BreadcrumbList', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[{ name: '首頁', url: siteUrl }]}
      />
    );
    const data = getJsonLd(container);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('BreadcrumbList');
  });

  it('有分類路徑時應包含三層（首頁 → 分類 → 文章）', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: '首頁', url: siteUrl },
          { name: '技術', url: `${siteUrl}/categories/tech` },
          { name: 'Next.js 指南', url: `${siteUrl}/posts/nextjs-guide` },
        ]}
      />
    );
    const data = getJsonLd(container);

    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[0].item).toBe(siteUrl);
    expect(data.itemListElement[0].name).toBe('首頁');
    expect(data.itemListElement[1].position).toBe(2);
    expect(data.itemListElement[1].name).toBe('技術');
    expect(data.itemListElement[2].position).toBe(3);
    expect(data.itemListElement[2].name).toBe('Next.js 指南');
  });

  it('無分類時應為兩層（首頁 → 文章）', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: '首頁', url: siteUrl },
          { name: 'React 入門', url: `${siteUrl}/posts/react-intro` },
        ]}
      />
    );
    const data = getJsonLd(container);

    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[1].position).toBe(2);
  });

  it('子分類層級應正確標記 position', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: '首頁', url: siteUrl },
          { name: '技術', url: `${siteUrl}/categories/tech` },
          { name: '前端', url: `${siteUrl}/categories/frontend` },
          { name: 'React 教學', url: `${siteUrl}/posts/react-tutorial` },
        ]}
      />
    );
    const data = getJsonLd(container);

    expect(data.itemListElement).toHaveLength(4);
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[1].position).toBe(2);
    expect(data.itemListElement[2].position).toBe(3);
    expect(data.itemListElement[3].position).toBe(4);
  });

  it('每個 itemListElement 應有正確的 @type', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: '首頁', url: siteUrl },
          { name: '文章', url: `${siteUrl}/posts/test` },
        ]}
      />
    );
    const data = getJsonLd(container);

    for (const item of data.itemListElement) {
      expect(item['@type']).toBe('ListItem');
    }
  });
});
