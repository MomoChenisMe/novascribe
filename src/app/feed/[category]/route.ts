import { Feed } from 'feed';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { renderMarkdown } from '@/lib/markdown';

const SITE_NAME = 'NovaScribe';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novascribe.example.com';
const MAX_FEED_ITEMS = 50;

interface RouteContext {
  params: Promise<{ category: string }>;
}

/**
 * GET /feed/[category].xml
 * 分類 RSS Feed
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { category: categorySlug } = await context.params;

    // 查詢分類
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return new Response('Category not found', { status: 404 });
    }

    // 查詢該分類下的已發佈文章
    const posts = await prisma.post.findMany({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: MAX_FEED_ITEMS,
      include: {
        category: true,
      },
    });

    // 建立 Feed
    const feedTitle = `${SITE_NAME} - ${category.name}`;
    const feedDescription = category.description || `${category.name} 分類文章`;

    const feed = new Feed({
      title: feedTitle,
      description: feedDescription,
      id: `${SITE_URL}/categories/${category.slug}`,
      link: `${SITE_URL}/categories/${category.slug}`,
      language: 'zh-Hant',
      copyright: `© ${new Date().getFullYear()} ${SITE_NAME}`,
      feedLinks: {
        rss2: `${SITE_URL}/feed/${category.slug}.xml`,
      },
      author: {
        name: SITE_NAME,
        link: SITE_URL,
      },
    });

    // 新增文章
    for (const post of posts) {
      const postUrl = `${SITE_URL}/posts/${post.slug}`;
      const content = await renderMarkdown(post.content);

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.excerpt || '',
        content, // 全文
        date: post.publishedAt || post.createdAt,
        category: [{ name: category.name }],
      });
    }

    // 返回 RSS 2.0 XML
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('分類 Feed 生成錯誤:', error);
    return new Response('Feed generation failed', { status: 500 });
  }
}

// ISR: 每小時重新生成
export const revalidate = 3600;
