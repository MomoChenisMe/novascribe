import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/services/public-category.service'
import { getPublishedPosts } from '@/lib/services/public-post.service'
import ArticleCard from '@/components/public/article/ArticleCard'
import Pagination from '@/components/public/common/Pagination'
import Breadcrumb from '@/components/public/common/Breadcrumb'

export const revalidate = 300 // 每 5 分鐘重新驗證

interface CategoryPostsPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: CategoryPostsPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    return {
      title: '分類未找到',
      description: '您要找的分類不存在。'
    }
  }

  return {
    title: `NovaScribe — ${category.name}`,
    description: category.description || `瀏覽 NovaScribe 中所有${category.name}分類的文章。`,
    openGraph: {
      title: `NovaScribe — ${category.name}`,
      description: category.description || `瀏覽 NovaScribe 中所有${category.name}分類的文章。`,
      type: 'website',
      url: `https://novascribe.dev/categories/${category.slug}`,
    },
    twitter: {
      card: 'summary',
      title: `NovaScribe — ${category.name}`,
      description: category.description || `瀏覽 NovaScribe 中所有${category.name}分類的文章。`,
    },
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
  }
}

export default async function CategoryPostsPage({ params, searchParams }: CategoryPostsPageProps) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  const currentPage = parseInt(searchParams.page || '1', 10)
  const { posts, total, totalPages } = await getPublishedPosts({
    page: currentPage,
    limit: 10,
    categorySlug: params.slug
  })

  // 麵包屑
  const breadcrumbItems = [
    { label: '首頁', href: '/' },
    { label: '分類', href: '/categories' },
    { label: category.name, href: `/categories/${category.slug}` }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Category Header */}
      <div className="mt-6 mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          共 {total} 篇文章
        </p>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            此分類目前沒有文章
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
              basePath={`/categories/${category.slug}`}
            />
          )}
        </>
      )}
    </div>
  )
}
