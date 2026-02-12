/**
 * @file SEO 改善建議產生器
 * @description 根據文章 SEO 設定產生改善建議
 *   - 各規則觸發條件
 *   - Title 太短/太長
 *   - Description 缺失/太短/太長
 *   - 無 OG image
 *   - 內容太短
 *   - 無 Focus Keyword
 */

export interface SeoSuggestion {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  postId?: string;
  postTitle?: string;
}

export interface PostSeoData {
  id: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  focusKeyword?: string | null;
  seoScore?: number | null;
}

/**
 * 為單篇文章產生 SEO 改善建議
 */
export function generateSuggestions(post: PostSeoData): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];

  // 1. Meta Title 檢查
  if (!post.metaTitle || post.metaTitle.length === 0) {
    suggestions.push({
      type: 'error',
      rule: 'meta_title_missing',
      message: '未設定 meta title',
      postId: post.id,
      postTitle: post.title,
    });
  } else if (post.metaTitle.length < 30) {
    suggestions.push({
      type: 'warning',
      rule: 'meta_title_short',
      message: '標題過短，建議增加至 50-70 字元',
      postId: post.id,
      postTitle: post.title,
    });
  } else if (post.metaTitle.length > 70) {
    suggestions.push({
      type: 'warning',
      rule: 'meta_title_long',
      message: '標題過長，建議縮減至 50-70 字元',
      postId: post.id,
      postTitle: post.title,
    });
  }

  // 2. Meta Description 檢查
  if (!post.metaDescription || post.metaDescription.length === 0) {
    suggestions.push({
      type: 'error',
      rule: 'meta_description_missing',
      message: '新增 meta description（120-160 字元）',
      postId: post.id,
      postTitle: post.title,
    });
  } else if (post.metaDescription.length < 120) {
    suggestions.push({
      type: 'warning',
      rule: 'meta_description_short',
      message: 'Meta description 過短（建議 120-160 字元）',
      postId: post.id,
      postTitle: post.title,
    });
  } else if (post.metaDescription.length > 160) {
    suggestions.push({
      type: 'warning',
      rule: 'meta_description_long',
      message: 'Meta description 過長（建議 120-160 字元）',
      postId: post.id,
      postTitle: post.title,
    });
  }

  // 3. OG Image 檢查
  if (!post.ogImage || post.ogImage.length === 0) {
    suggestions.push({
      type: 'warning',
      rule: 'og_image_missing',
      message: '上傳 Open Graph 圖片（建議 1200x630）',
      postId: post.id,
      postTitle: post.title,
    });
  }

  // 4. 內容長度檢查
  if (post.content.length < 500) {
    suggestions.push({
      type: 'warning',
      rule: 'content_short',
      message: '增加內容至至少 800 字',
      postId: post.id,
      postTitle: post.title,
    });
  }

  // 5. Focus Keyword 檢查
  if (!post.focusKeyword || post.focusKeyword.length === 0) {
    suggestions.push({
      type: 'info',
      rule: 'focus_keyword_missing',
      message: '建議設定 Focus Keyword 以提升 SEO 評分',
      postId: post.id,
      postTitle: post.title,
    });
  }

  return suggestions;
}

/**
 * 為多篇文章產生彙整建議
 */
export function generateBulkSuggestions(posts: PostSeoData[]): SeoSuggestion[] {
  const allSuggestions: SeoSuggestion[] = [];

  for (const post of posts) {
    allSuggestions.push(...generateSuggestions(post));
  }

  // 依嚴重程度排序：error > warning > info
  const priority: Record<string, number> = { error: 0, warning: 1, info: 2 };
  allSuggestions.sort(
    (a, b) => (priority[a.type] ?? 3) - (priority[b.type] ?? 3)
  );

  return allSuggestions;
}
