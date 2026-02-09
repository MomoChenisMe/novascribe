/**
 * @file WebSiteJsonLd 元件單元測試
 * @description 測試網站結構化資料元件
 *   - 包含 SearchAction
 *   - 預設標題
 *   - 完整欄位
 */

import React from 'react';
import { render } from '@testing-library/react';
import { WebSiteJsonLd } from '@/components/seo/WebSiteJsonLd';

function getJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script) return null;
  return JSON.parse(script.textContent || '');
}

describe('WebSiteJsonLd', () => {
  const defaultProps = {
    name: '我的部落格',
    url: 'https://blog.example.com',
  };

  it('應渲染 script tag with type application/ld+json', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('JSON-LD @context 應為 https://schema.org', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data['@context']).toBe('https://schema.org');
  });

  it('JSON-LD @type 應為 WebSite', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data['@type']).toBe('WebSite');
  });

  it('應包含 name 和 url', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data.name).toBe('我的部落格');
    expect(data.url).toBe('https://blog.example.com');
  });

  it('應包含 SearchAction', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data.potentialAction).toBeDefined();
    expect(data.potentialAction['@type']).toBe('SearchAction');
    expect(data.potentialAction.target).toBe(
      'https://blog.example.com/search?q={search_term_string}'
    );
    expect(data.potentialAction['query-input']).toBe(
      'required name=search_term_string'
    );
  });

  it('應包含 description', () => {
    const { container } = render(
      <WebSiteJsonLd {...defaultProps} description="一個技術部落格" />
    );
    const data = getJsonLd(container);

    expect(data.description).toBe('一個技術部落格');
  });

  it('無 description 時應省略', () => {
    const { container } = render(<WebSiteJsonLd {...defaultProps} />);
    const data = getJsonLd(container);

    expect(data.description).toBeUndefined();
  });

  it('預設標題為 url 時仍正常運作', () => {
    const { container } = render(
      <WebSiteJsonLd name="NovaScribe" url="https://novascribe.dev" />
    );
    const data = getJsonLd(container);

    expect(data.name).toBe('NovaScribe');
    expect(data.potentialAction.target).toBe(
      'https://novascribe.dev/search?q={search_term_string}'
    );
  });
});
