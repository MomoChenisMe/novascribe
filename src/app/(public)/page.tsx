import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/public/ArticleCard';
import Pagination from '@/components/public/Pagination';
import NewsletterForm from '@/components/public/NewsletterForm';

const SITE_NAME = 'NovaScribe';
const SITE_DESCRIPTION = '技術部落格 - 分享程式開發、前端技術與實作經驗';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novascribe.example.com';
const POSTS_PER_PAGE = 9;

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

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * 首頁 - Magazine Grid 文章列表
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // 獲取文章總數
  const totalPosts = await prisma.post.count({
    where: { status: 'PUBLISHED' },
  });

  // 載入已發布的文章列表 (含分頁)
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take: POSTS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12 text-[var(--color-text-primary)]">
          最新文章
        </h1>

        {posts.length === 0 ? (
          <p className="text-[var(--color-text-secondary)] text-center py-12">
            暫無文章
          </p>
        ) : (
          <>
            {/* Magazine Grid - 3 欄網格佈局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  post={{
                    title: post.title,
                    excerpt: post.excerpt || '',
                    coverImage: post.coverImage || '/images/default-cover.jpg',
                    slug: post.slug,
                    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
                    category: post.category || { name: '未分類', slug: 'uncategorized' },
                  }}
                />
              ))}
            </div>

            {/* 分頁導航 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/"
            />
          </>
        )}
      </div>

      {/* Newsletter 訂閱區塊 */}
      <NewsletterForm />
    </>
  );
}

// ISR 設定：每 5 分鐘重新驗證
export const revalidate = 300;
