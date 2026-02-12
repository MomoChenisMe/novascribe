import { Metadata } from 'next'
import { getPublicCategories } from '@/lib/services/public-category.service'
import CategoryList from '@/components/public/common/CategoryList'

export const revalidate = 300 // 每 5 分鐘重新驗證

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'NovaScribe — 分類',
    description: '瀏覽 NovaScribe 所有文章分類，探索感興趣的主題領域。',
    openGraph: {
      title: 'NovaScribe — 分類',
      description: '瀏覽 NovaScribe 所有文章分類，探索感興趣的主題領域。',
      type: 'website',
      url: 'https://novascribe.dev/categories',
    },
    twitter: {
      card: 'summary',
      title: 'NovaScribe — 分類',
      description: '瀏覽 NovaScribe 所有文章分類，探索感興趣的主題領域。',
    },
    alternates: {
      canonical: '/categories',
    },
  }
}

export default async function CategoriesPage() {
  const categories = await getPublicCategories()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          文章分類
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          探索不同主題的文章
        </p>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              目前沒有分類
            </p>
          </div>
        ) : (
          <CategoryList categories={categories} />
        )}
      </div>
    </div>
  )
}
