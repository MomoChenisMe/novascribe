import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { FeaturedHero } from '@/components/public/home/FeaturedHero';
import { VisualGrid } from '@/components/public/home/VisualGrid';
import Pagination from '@/components/public/Pagination';

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
 * 首頁 - Magazine Style Layout
 * Featured Hero (最新文章) + Visual Grid (其餘文章)
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // 獲取文章總數
  const totalPosts = await prisma.post.count({
    where: { status: 'PUBLISHED' },
  });

  // 載入已發布的文章列表
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take: POSTS_PER_PAGE + (currentPage === 1 ? 1 : 0), // 第一頁多取一篇作為 Hero
  });

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 第一頁：第一篇為 Hero，其餘進 Grid
  const isFirstPage = currentPage === 1;
  const featuredPost = isFirstPage && posts.length > 0 ? posts[0] : null;
  const gridPosts = isFirstPage ? posts.slice(1) : posts;

  const mapPost = (post: (typeof posts)[0]) => ({
    title: post.title,
    excerpt: post.excerpt || '',
    coverImage: post.coverImage || '/images/default-cover.jpg',
    slug: post.slug,
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    category: post.category || { name: '未分類', slug: 'uncategorized' },
  });

  return (
    <>
      {/* Featured Hero - 僅首頁第一頁顯示 */}
      {featuredPost && <FeaturedHero post={mapPost(featuredPost)} />}

      {/* Visual Grid */}
      <div className="container-responsive py-12">
        {posts.length === 0 ? (
          <p className="text-text-secondary text-center py-12">
            暫無文章
          </p>
        ) : (
          <>
            <VisualGrid posts={gridPosts.map(mapPost)} />

            {/* 分頁導航 */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ISR 設定：每 5 分鐘重新驗證
export const revalidate = 300;
