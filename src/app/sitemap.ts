/**
 * @file 動態 Sitemap 生成
 * @description Next.js App Router 原生 sitemap.ts
 *   - 包含首頁、已發佈文章、分類頁、標籤頁
 *   - 排除草稿/下架/noIndex 文章
 *   - 從 SitemapConfig 讀取設定（changefreq、priority）
 */

import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // 查詢所有已發佈文章
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, slug: true, updatedAt: true },
  });

  // 查詢 noIndex 的文章 ID 集合
  const noIndexEntries = await prisma.seoMetadata.findMany({
    where: { noIndex: true },
    select: { postId: true },
  });
  const noIndexPostIds = new Set(noIndexEntries.map((e) => e.postId));

  // 過濾掉 noIndex 文章
  const visiblePosts = posts.filter((post) => !noIndexPostIds.has(post.id));

  // 查詢分類
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  // 查詢標籤
  const tags = await prisma.tag.findMany({
    select: { slug: true, updatedAt: true },
  });

  // 讀取 sitemap 設定
  const configs = await prisma.sitemapConfig.findMany();
  const configMap = new Map(configs.map((c) => [c.path, c]));

  const getPostConfig = () => configMap.get('/posts/*');
  const getCategoryConfig = () => configMap.get('/categories/*');
  const getTagConfig = () => configMap.get('/tags/*');

  const entries: MetadataRoute.Sitemap = [
    // 首頁
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 文章
  const postConfig = getPostConfig();
  for (const post of visiblePosts) {
    entries.push({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency:
        (postConfig?.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) ||
        'weekly',
      priority: postConfig?.priority ?? 0.8,
    });
  }

  // 分類頁
  const categoryConfig = getCategoryConfig();
  for (const category of categories) {
    entries.push({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency:
        (categoryConfig?.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) ||
        'weekly',
      priority: categoryConfig?.priority ?? 0.6,
    });
  }

  // 標籤頁
  const tagConfig = getTagConfig();
  for (const tag of tags) {
    entries.push({
      url: `${siteUrl}/tags/${tag.slug}`,
      lastModified: tag.updatedAt,
      changeFrequency:
        (tagConfig?.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) ||
        'weekly',
      priority: tagConfig?.priority ?? 0.5,
    });
  }

  return entries;
}
