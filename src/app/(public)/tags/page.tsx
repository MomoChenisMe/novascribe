import { Metadata } from 'next'
import { getPublicTags } from '@/lib/services/public-tag.service'
import TagCloud from '@/components/public/common/TagCloud'

export const revalidate = 300 // 每 5 分鐘重新驗證

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'NovaScribe — 標籤',
    description: '瀏覽 NovaScribe 所有文章標籤，探索感興趣的技術主題。',
    openGraph: {
      title: 'NovaScribe — 標籤',
      description: '瀏覽 NovaScribe 所有文章標籤，探索感興趣的技術主題。',
      type: 'website',
      url: 'https://novascribe.dev/tags',
    },
    twitter: {
      card: 'summary',
      title: 'NovaScribe — 標籤',
      description: '瀏覽 NovaScribe 所有文章標籤，探索感興趣的技術主題。',
    },
    alternates: {
      canonical: '/tags',
    },
  }
}

export default async function TagsPage() {
  const tags = await getPublicTags()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          文章標籤
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          探索不同主題的文章標籤
        </p>

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              目前沒有標籤
            </p>
          </div>
        ) : (
          <TagCloud tags={tags} />
        )}
      </div>
    </div>
  )
}
