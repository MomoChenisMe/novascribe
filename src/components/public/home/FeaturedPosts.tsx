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

interface FeaturedPostsProps {
  posts: Post[]
  title?: string
}

export default function FeaturedPosts({ posts, title = '精選文章' }: FeaturedPostsProps) {
  // 只顯示前 3 篇
  const featuredPosts = posts.slice(0, 3)

  if (featuredPosts.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-text mb-8">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
