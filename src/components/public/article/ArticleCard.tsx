import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    publishedAt: Date;
    readingTime: number;
    commentCount?: number;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
}

/**
 * ArticleCard 元件
 * 文章卡片（首頁列表用）
 * 包含封面圖、標題、摘要、日期、分類、標籤、閱讀時間
 */
export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      {/* 封面圖 */}
      <Link href={`/posts/${article.slug}`}>
        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
          <Image
            src={article.featuredImage || '/images/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-6">
        {/* 分類 */}
        {article.category && (
          <Link
            href={`/categories/${article.category.slug}`}
            className="inline-block text-xs font-semibold text-primary hover:text-primary-dark mb-2"
          >
            {article.category.name}
          </Link>
        )}

        {/* 標題 */}
        <Link href={`/posts/${article.slug}`}>
          <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>
        </Link>

        {/* 摘要 */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Meta 資訊 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-4">
          <time dateTime={article.publishedAt.toISOString()}>
            {formattedDate}
          </time>
          <span>·</span>
          <span>{article.readingTime} 分鐘閱讀</span>
          {article.commentCount !== undefined && article.commentCount > 0 && (
            <>
              <span>·</span>
              <span data-testid="comment-count">
                💬 {article.commentCount} 則評論
              </span>
            </>
          )}
        </div>

        {/* 標籤 */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
