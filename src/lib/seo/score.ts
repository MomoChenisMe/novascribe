/**
 * @file SEO 評分計算函式
 * @description 根據 10 項 SEO 檢查項目計算文章的 SEO 分數
 *   每項 10 分，滿分 100 分
 *
 * 檢查項目：
 * 1. Meta title 存在且長度適中（50-70 字元）
 * 2. Meta description 存在且長度適中（120-160 字元）
 * 3. Focus keyword 存在且出現在 title
 * 4. Focus keyword 出現在 description
 * 5. Focus keyword 出現在內文
 * 6. OG image 設定
 * 7. 內容長度 ≥ 800 字
 * 8. 至少 2 個子標題（H2/H3）
 * 9. 至少 1 個內部連結
 * 10. 至少 1 個外部連結
 */

export interface SeoScoreInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
  content: string;
  title: string;
}

export interface SeoScoreItem {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  passed: boolean;
}

export type SeoGrade = '優良' | '尚可' | '需改善';

export interface SeoScoreResult {
  totalScore: number;
  maxScore: number;
  items: SeoScoreItem[];
  grade: SeoGrade;
}

/**
 * 判定 SEO 評分等級
 */
export function getSeoGrade(score: number): SeoGrade {
  if (score >= 80) return '優良';
  if (score >= 60) return '尚可';
  return '需改善';
}

/**
 * 計算 SEO 評分
 */
export function calculateSeoScore(input: SeoScoreInput): SeoScoreResult {
  const items: SeoScoreItem[] = [];

  // 1. Meta title 存在且長度適中（50-70 字元）
  const metaTitleLen = input.metaTitle?.length ?? 0;
  const metaTitlePassed = metaTitleLen >= 50 && metaTitleLen <= 70;
  items.push({
    name: 'Meta Title',
    score: metaTitlePassed ? 10 : 0,
    maxScore: 10,
    description: metaTitlePassed
      ? 'Meta title 長度適中'
      : metaTitleLen === 0
        ? '未設定 meta title'
        : metaTitleLen < 50
          ? 'Meta title 過短（建議 50-70 字元）'
          : 'Meta title 過長（建議 50-70 字元）',
    passed: metaTitlePassed,
  });

  // 2. Meta description 存在且長度適中（120-160 字元）
  const metaDescLen = input.metaDescription?.length ?? 0;
  const metaDescPassed = metaDescLen >= 120 && metaDescLen <= 160;
  items.push({
    name: 'Meta Description',
    score: metaDescPassed ? 10 : 0,
    maxScore: 10,
    description: metaDescPassed
      ? 'Meta description 長度適中'
      : metaDescLen === 0
        ? '未設定 meta description'
        : metaDescLen < 120
          ? 'Meta description 過短（建議 120-160 字元）'
          : 'Meta description 過長（建議 120-160 字元）',
    passed: metaDescPassed,
  });

  // 3. Focus keyword 存在且出現在 title
  const keyword = input.focusKeyword?.toLowerCase() ?? '';
  const titleLower = input.title.toLowerCase();
  const keywordInTitle = keyword.length > 0 && titleLower.includes(keyword);
  items.push({
    name: 'Focus Keyword in Title',
    score: keywordInTitle ? 10 : 0,
    maxScore: 10,
    description: keywordInTitle
      ? 'Focus keyword 出現在標題中'
      : keyword.length === 0
        ? '未設定 focus keyword'
        : 'Focus keyword 未出現在標題中',
    passed: keywordInTitle,
  });

  // 4. Focus keyword 出現在 description
  const descLower = (input.metaDescription ?? '').toLowerCase();
  const keywordInDesc = keyword.length > 0 && descLower.includes(keyword);
  items.push({
    name: 'Focus Keyword in Description',
    score: keywordInDesc ? 10 : 0,
    maxScore: 10,
    description: keywordInDesc
      ? 'Focus keyword 出現在描述中'
      : keyword.length === 0
        ? '未設定 focus keyword'
        : 'Focus keyword 未出現在描述中',
    passed: keywordInDesc,
  });

  // 5. Focus keyword 出現在內文
  const contentLower = input.content.toLowerCase();
  const keywordInContent = keyword.length > 0 && contentLower.includes(keyword);
  items.push({
    name: 'Focus Keyword in Content',
    score: keywordInContent ? 10 : 0,
    maxScore: 10,
    description: keywordInContent
      ? 'Focus keyword 出現在內文中'
      : keyword.length === 0
        ? '未設定 focus keyword'
        : 'Focus keyword 未出現在內文中',
    passed: keywordInContent,
  });

  // 6. OG image 設定
  const hasOgImage = !!input.ogImage && input.ogImage.length > 0;
  items.push({
    name: 'OG Image',
    score: hasOgImage ? 10 : 0,
    maxScore: 10,
    description: hasOgImage ? '已設定 OG image' : '未設定 OG image',
    passed: hasOgImage,
  });

  // 7. 內容長度 ≥ 800 字
  const contentLength = input.content.length;
  const contentLengthPassed = contentLength >= 800;
  items.push({
    name: 'Content Length',
    score: contentLengthPassed ? 10 : 0,
    maxScore: 10,
    description: contentLengthPassed
      ? `內容長度足夠（${contentLength} 字）`
      : `內容過短（${contentLength} 字，建議 ≥ 800 字）`,
    passed: contentLengthPassed,
  });

  // 8. 至少 2 個子標題（H2/H3）
  const headingMatches = input.content.match(/^#{2,3}\s+.+$/gm) ?? [];
  const hasHeadings = headingMatches.length >= 2;
  items.push({
    name: 'Subheadings',
    score: hasHeadings ? 10 : 0,
    maxScore: 10,
    description: hasHeadings
      ? `包含 ${headingMatches.length} 個子標題`
      : `子標題不足（${headingMatches.length} 個，建議至少 2 個）`,
    passed: hasHeadings,
  });

  // 9. 至少 1 個內部連結（以 / 開頭或同域名的 markdown 連結）
  const internalLinkMatches =
    input.content.match(/\[.+?\]\(\/.+?\)/g) ?? [];
  const hasInternalLinks = internalLinkMatches.length >= 1;
  items.push({
    name: 'Internal Links',
    score: hasInternalLinks ? 10 : 0,
    maxScore: 10,
    description: hasInternalLinks
      ? `包含 ${internalLinkMatches.length} 個內部連結`
      : '未包含內部連結',
    passed: hasInternalLinks,
  });

  // 10. 至少 1 個外部連結（以 http 開頭的 markdown 連結）
  const externalLinkMatches =
    input.content.match(/\[.+?\]\(https?:\/\/.+?\)/g) ?? [];
  const hasExternalLinks = externalLinkMatches.length >= 1;
  items.push({
    name: 'External Links',
    score: hasExternalLinks ? 10 : 0,
    maxScore: 10,
    description: hasExternalLinks
      ? `包含 ${externalLinkMatches.length} 個外部連結`
      : '未包含外部連結',
    passed: hasExternalLinks,
  });

  const totalScore = items.reduce((sum, item) => sum + item.score, 0);

  return {
    totalScore,
    maxScore: 100,
    items,
    grade: getSeoGrade(totalScore),
  };
}
