import Link from 'next/link'
import ArticleCard from '@/components/public/article/ArticleCard'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string | null
  publishedAt: Date
  category?: { id: string; name: string; slug: string } | null
  tags?: { tag: { id: string; name: string; slug: string } }[]
  readingTime?: string
}

interface RecentPostsProps {
  posts: Post[]
  title?: string
  hasMore?: boolean
  viewMoreLink?: string
}

export default function RecentPosts({
  posts,
  title = '最新文章',
  hasMore = false,
  viewMoreLink = '/posts',
}: RecentPostsProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-text">{title}</h2>
          {hasMore && (
            <Link
              href={viewMoreLink}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              查看更多 →
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-secondary text-center py-12">目前沒有文章</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
