import Link from 'next/link';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

/**
 * RelatedPosts 元件
 * 顯示相關文章推薦（最多 3 篇）
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return <section></section>;
  }

  // 限制最多顯示 3 篇
  const displayPosts = posts.slice(0, 3);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">相關文章</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPosts.map((post) => {
          const formattedDate = new Date(post.publishedAt).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <article 
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <Link href={`/posts/${post.slug}`}>
                <h3 className="text-lg font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              
              <time 
                className="text-xs text-gray-500 dark:text-gray-500"
                dateTime={post.publishedAt.toISOString()}
              >
                {formattedDate}
              </time>
            </article>
          );
        })}
      </div>
    </section>
  );
}
