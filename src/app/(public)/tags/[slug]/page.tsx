import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTagBySlug } from '@/lib/services/public-tag.service'
import { getPublishedPosts } from '@/lib/services/public-post.service'
import ArticleCard from '@/components/public/article/ArticleCard'
import Pagination from '@/components/public/common/Pagination'
import Breadcrumb from '@/components/public/common/Breadcrumb'

export const revalidate = 300 // 每 5 分鐘重新驗證

interface TagPostsPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: TagPostsPageProps): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    return {
      title: '標籤未找到',
      description: '您要找的標籤不存在。'
    }
  }

  return {
    title: `NovaScribe — ${tag.name}`,
    description: `瀏覽 NovaScribe 中所有帶有「${tag.name}」標籤的文章。`,
    openGraph: {
      title: `NovaScribe — ${tag.name}`,
      description: `瀏覽 NovaScribe 中所有帶有「${tag.name}」標籤的文章。`,
      type: 'website',
      url: `https://novascribe.dev/tags/${tag.slug}`,
    },
    twitter: {
      card: 'summary',
      title: `NovaScribe — ${tag.name}`,
      description: `瀏覽 NovaScribe 中所有帶有「${tag.name}」標籤的文章。`,
    },
    alternates: {
      canonical: `/tags/${tag.slug}`,
    },
  }
}

export default async function TagPostsPage({ params, searchParams }: TagPostsPageProps) {
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    notFound()
  }

  const currentPage = parseInt(searchParams.page || '1', 10)
  const { posts, total, totalPages } = await getPublishedPosts({
    page: currentPage,
    limit: 10,
    tagSlug: params.slug
  })

  // 麵包屑
  const breadcrumbItems = [
    { label: '首頁', href: '/' },
    { label: '標籤', href: '/tags' },
    { label: tag.name, href: `/tags/${tag.slug}` }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Tag Header */}
      <div className="mt-6 mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          #{tag.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          共 {total} 篇文章
        </p>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            此標籤目前沒有文章
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {posts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/tags/${tag.slug}`}
            />
          )}
        </>
      )}
    </div>
  )
}
