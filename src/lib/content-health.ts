interface HealthCheckResult {
  score: number;
  seoScore: number;
  structureScore: number;
  suggestions: string[];
}

export function checkContentHealth(article: {
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}): HealthCheckResult {
  const suggestions: string[] = [];
  let seoScore = 100;
  let structureScore = 100;

  // SEO checks (30% weight)
  if (!article.metaTitle) {
    seoScore -= 30;
    suggestions.push("新增 Meta Title");
  } else if (article.metaTitle.length < 30 || article.metaTitle.length > 60) {
    seoScore -= 15;
    suggestions.push("Meta Title 長度建議 50-60 字元");
  }

  if (!article.metaDescription) {
    seoScore -= 40;
    suggestions.push("新增 Meta Description");
  } else if (
    article.metaDescription.length < 120 ||
    article.metaDescription.length > 160
  ) {
    seoScore -= 15;
    suggestions.push("Meta Description 長度建議 150-160 字元");
  }

  if (!article.ogImage) {
    seoScore -= 30;
    suggestions.push("新增 Open Graph 圖片");
  }

  // Content structure checks (30% weight)
  const headingCount = (article.content.match(/<h[1-6]/gi) || []).length;
  if (headingCount === 0) {
    structureScore -= 30;
    suggestions.push("文章缺少標題結構 (H2/H3)");
  }

  const contentLength = article.content.replace(/<[^>]*>/g, "").length;
  if (contentLength < 300) {
    structureScore -= 40;
    suggestions.push("文章內容過短，建議至少 300 字元");
  }

  const paragraphs = article.content.split(/<\/p>/gi).length - 1;
  if (paragraphs < 3) {
    structureScore -= 30;
    suggestions.push("建議增加更多段落以提升可讀性");
  }

  // Final score (weighted)
  const score = Math.round(
    Math.max(0, seoScore) * 0.5 + Math.max(0, structureScore) * 0.5
  );

  return {
    score,
    seoScore: Math.max(0, seoScore),
    structureScore: Math.max(0, structureScore),
    suggestions,
  };
}
