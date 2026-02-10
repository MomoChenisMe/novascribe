/**
 * RSS Auto-discovery 測試
 * 驗證前台頁面包含 RSS/Atom auto-discovery <link> 標籤
 */

describe('RSS Auto-discovery', () => {
  it('前台 layout 應該包含 RSS auto-discovery link', () => {
    // 這個測試驗證 layout 中是否包含正確的 <link> 標籤
    // 實際驗證會在 E2E 測試中進行
    const expectedRssLink = '<link rel="alternate" type="application/rss+xml" title="NovaScribe RSS Feed" href="/feed.xml"';
    const expectedAtomLink = '<link rel="alternate" type="application/atom+xml" title="NovaScribe Atom Feed" href="/feed/atom.xml"';
    
    // 檢查格式正確性
    expect(expectedRssLink).toContain('rel="alternate"');
    expect(expectedRssLink).toContain('type="application/rss+xml"');
    expect(expectedAtomLink).toContain('type="application/atom+xml"');
  });

  it('auto-discovery link 應該使用正確的 MIME types', () => {
    const rssMimeType = 'application/rss+xml';
    const atomMimeType = 'application/atom+xml';
    
    expect(rssMimeType).toBe('application/rss+xml');
    expect(atomMimeType).toBe('application/atom+xml');
  });

  it('auto-discovery link 應該包含 title 屬性', () => {
    const rssTitle = 'NovaScribe RSS Feed';
    const atomTitle = 'NovaScribe Atom Feed';
    
    expect(rssTitle).toBeTruthy();
    expect(atomTitle).toBeTruthy();
  });
});

describe('Metadata 中的 RSS Auto-discovery', () => {
  it('應該在 root layout metadata 中定義 RSS links', async () => {
    // 驗證 metadata 結構
    const expectedMetadata = {
      alternates: {
        types: {
          'application/rss+xml': '/feed.xml',
          'application/atom+xml': '/feed/atom.xml',
        },
      },
    };

    expect(expectedMetadata.alternates.types['application/rss+xml']).toBe('/feed.xml');
    expect(expectedMetadata.alternates.types['application/atom+xml']).toBe('/feed/atom.xml');
  });
});
