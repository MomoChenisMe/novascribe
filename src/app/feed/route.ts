import { Feed } from 'feed';
import prisma from '@/lib/prisma';
import { renderMarkdown } from '@/lib/markdown';

const SITE_NAME = 'NovaScribe';
const SITE_DESCRIPTION = '技術部落格 - 分享程式開發、前端技術與實作經驗';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novascribe.example.com';
const MAX_FEED_ITEMS = 50;

/**
 * GET /feed.xml
 * RSS 2.0 Feed
 */
export async function GET() {
  try {
    // 查詢最新的已發佈文章
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: MAX_FEED_ITEMS,
      include: {
        category: true,
      },
    });

    // 建立 Feed
    const feed = new Feed({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      id: SITE_URL,
      link: SITE_URL,
      language: 'zh-Hant',
      copyright: `© ${new Date().getFullYear()} ${SITE_NAME}`,
      feedLinks: {
        rss2: `${SITE_URL}/feed.xml`,
        atom: `${SITE_URL}/feed/atom.xml`,
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
        category: post.category ? [{ name: post.category.name }] : [],
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
    console.error('RSS Feed 生成錯誤:', error);
    return new Response('Feed generation failed', { status: 500 });
  }
}

// ISR: 每小時重新生成
export const revalidate = 3600;
