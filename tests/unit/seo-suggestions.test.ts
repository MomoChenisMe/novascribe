/**
 * @file SEO 改善建議產生器單元測試
 * @description 測試 SEO 改善建議
 *   - 各規則觸發條件
 *   - Title 太短/太長
 *   - Description 缺失/太短/太長
 *   - 無 OG image
 *   - 內容太短
 *   - 無 Focus Keyword
 *   - 無建議時的回應
 *   - 批次建議排序
 */

import {
  generateSuggestions,
  generateBulkSuggestions,
  type PostSeoData,
} from '@/lib/seo/suggestions';

function createPost(overrides: Partial<PostSeoData> = {}): PostSeoData {
  return {
    id: 'post-1',
    title: 'Test Post',
    content: 'x'.repeat(600),
    metaTitle: 'A good meta title that is the right length',
    metaDescription:
      'A meta description that is exactly the right length for search engine optimization and provides users with clear understanding.',
    ogImage: '/og.jpg',
    focusKeyword: 'test keyword',
    seoScore: 85,
    ...overrides,
  };
}

describe('generateSuggestions', () => {
  it('完善的文章不應產生建議', () => {
    const post = createPost();
    const suggestions = generateSuggestions(post);

    expect(suggestions).toHaveLength(0);
  });

  it('meta title 缺失應產生 error', () => {
    const post = createPost({ metaTitle: null });
    const suggestions = generateSuggestions(post);

    const titleSuggestion = suggestions.find(
      (s) => s.rule === 'meta_title_missing'
    );
    expect(titleSuggestion).toBeDefined();
    expect(titleSuggestion!.type).toBe('error');
  });

  it('meta title 空字串應產生 error', () => {
    const post = createPost({ metaTitle: '' });
    const suggestions = generateSuggestions(post);

    expect(suggestions.some((s) => s.rule === 'meta_title_missing')).toBe(true);
  });

  it('meta title 太短應產生 warning', () => {
    const post = createPost({ metaTitle: 'Short' });
    const suggestions = generateSuggestions(post);

    const titleSuggestion = suggestions.find(
      (s) => s.rule === 'meta_title_short'
    );
    expect(titleSuggestion).toBeDefined();
    expect(titleSuggestion!.type).toBe('warning');
    expect(titleSuggestion!.message).toContain('50-70');
  });

  it('meta title 太長應產生 warning', () => {
    const post = createPost({ metaTitle: 'x'.repeat(80) });
    const suggestions = generateSuggestions(post);

    const titleSuggestion = suggestions.find(
      (s) => s.rule === 'meta_title_long'
    );
    expect(titleSuggestion).toBeDefined();
    expect(titleSuggestion!.type).toBe('warning');
  });

  it('meta description 缺失應產生 error', () => {
    const post = createPost({ metaDescription: null });
    const suggestions = generateSuggestions(post);

    const descSuggestion = suggestions.find(
      (s) => s.rule === 'meta_description_missing'
    );
    expect(descSuggestion).toBeDefined();
    expect(descSuggestion!.type).toBe('error');
    expect(descSuggestion!.message).toContain('120-160');
  });

  it('meta description 太短應產生 warning', () => {
    const post = createPost({ metaDescription: 'Too short description' });
    const suggestions = generateSuggestions(post);

    expect(suggestions.some((s) => s.rule === 'meta_description_short')).toBe(
      true
    );
  });

  it('meta description 太長應產生 warning', () => {
    const post = createPost({ metaDescription: 'x'.repeat(200) });
    const suggestions = generateSuggestions(post);

    expect(suggestions.some((s) => s.rule === 'meta_description_long')).toBe(
      true
    );
  });

  it('OG image 缺失應產生 warning', () => {
    const post = createPost({ ogImage: null });
    const suggestions = generateSuggestions(post);

    const ogSuggestion = suggestions.find(
      (s) => s.rule === 'og_image_missing'
    );
    expect(ogSuggestion).toBeDefined();
    expect(ogSuggestion!.type).toBe('warning');
    expect(ogSuggestion!.message).toContain('1200x630');
  });

  it('內容太短應產生 warning', () => {
    const post = createPost({ content: 'Short content' });
    const suggestions = generateSuggestions(post);

    const contentSuggestion = suggestions.find(
      (s) => s.rule === 'content_short'
    );
    expect(contentSuggestion).toBeDefined();
    expect(contentSuggestion!.type).toBe('warning');
    expect(contentSuggestion!.message).toContain('800');
  });

  it('內容剛好 500 字元不應觸發 content_short', () => {
    const post = createPost({ content: 'x'.repeat(500) });
    const suggestions = generateSuggestions(post);

    expect(suggestions.some((s) => s.rule === 'content_short')).toBe(false);
  });

  it('focus keyword 缺失應產生 info', () => {
    const post = createPost({ focusKeyword: null });
    const suggestions = generateSuggestions(post);

    const kwSuggestion = suggestions.find(
      (s) => s.rule === 'focus_keyword_missing'
    );
    expect(kwSuggestion).toBeDefined();
    expect(kwSuggestion!.type).toBe('info');
  });

  it('建議應包含 postId 和 postTitle', () => {
    const post = createPost({ metaTitle: null, id: 'abc', title: 'My Post' });
    const suggestions = generateSuggestions(post);

    expect(suggestions[0].postId).toBe('abc');
    expect(suggestions[0].postTitle).toBe('My Post');
  });
});

describe('generateBulkSuggestions', () => {
  it('多篇文章應彙整所有建議', () => {
    const posts = [
      createPost({ id: '1', metaTitle: null }),
      createPost({ id: '2', metaDescription: null }),
    ];

    const suggestions = generateBulkSuggestions(posts);

    expect(suggestions.length).toBeGreaterThanOrEqual(2);
  });

  it('建議應依嚴重程度排序（error > warning > info）', () => {
    const post = createPost({
      metaTitle: null, // error
      ogImage: null, // warning
      focusKeyword: null, // info
    });

    const suggestions = generateBulkSuggestions([post]);

    const types = suggestions.map((s) => s.type);
    const errorIndex = types.indexOf('error');
    const warningIndex = types.indexOf('warning');
    const infoIndex = types.indexOf('info');

    if (errorIndex >= 0 && warningIndex >= 0) {
      expect(errorIndex).toBeLessThan(warningIndex);
    }
    if (warningIndex >= 0 && infoIndex >= 0) {
      expect(warningIndex).toBeLessThan(infoIndex);
    }
  });

  it('無文章時應回傳空陣列', () => {
    const suggestions = generateBulkSuggestions([]);
    expect(suggestions).toHaveLength(0);
  });

  it('所有文章完善時應回傳空陣列', () => {
    const posts = [createPost({ id: '1' }), createPost({ id: '2' })];
    const suggestions = generateBulkSuggestions(posts);

    expect(suggestions).toHaveLength(0);
  });
});
