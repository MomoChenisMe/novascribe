import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const SITE_NAME = 'NovaScribe';
const SITE_DESCRIPTION = '技術部落格 - 分享程式開發、前端技術與實作經驗';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novascribe.example.com';

/**
 * 首頁 SEO metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${SITE_NAME} - ${SITE_DESCRIPTION}`,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
  };
}

/**
 * 首頁
 */
export default async function HomePage() {
  // 載入已發布的文章列表
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, slug: true } },
      tags: {
        include: { tag: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">最新文章</h1>

      {posts.length === 0 ? (
        <p className="text-gray-600">暫無文章</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b pb-8">
              <h2 className="text-2xl font-bold mb-2">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </Link>
              </h2>

              {post.excerpt && (
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {post.category && (
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="hover:text-blue-600"
                  >
                    分類：{post.category.name}
                  </Link>
                )}

                {post.tags.length > 0 && (
                  <div className="flex gap-2">
                    <span>標籤：</span>
                    {post.tags.map((postTag) => (
                      <Link
                        key={postTag.tagId}
                        href={`/tags/${postTag.tag.slug}`}
                        className="hover:text-blue-600"
                      >
                        {postTag.tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {post.publishedAt && (
                  <span>
                    發佈於 {new Date(post.publishedAt).toLocaleDateString('zh-TW')}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ISR 設定：每 5 分鐘重新驗證
export const revalidate = 300;
