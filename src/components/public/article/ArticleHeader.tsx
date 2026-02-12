import Link from 'next/link';

interface ArticleHeaderProps {
  article: {
    title: string;
    publishedAt: Date;
    readingTime: number;
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
    author: {
      id: string;
      name: string;
    } | null;
  };
}

/**
 * ArticleHeader 元件
 * 文章標題區域，包含標題、作者、日期、閱讀時間、分類、標籤
 */
export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="mb-8">
      {/* 分類 */}
      {article.category && (
        <Link
          href={`/categories/${article.category.slug}`}
          className="inline-block text-sm font-semibold text-primary hover:text-primary-dark mb-4"
        >
          {article.category.name}
        </Link>
      )}

      {/* 標題 */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {article.title}
      </h1>

      {/* Meta 資訊 */}
      <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
        <span>作者：{article.author?.name || '匿名'}</span>
        <span>·</span>
        <time dateTime={article.publishedAt.toISOString()}>
          {formattedDate}
        </time>
        <span>·</span>
        <span>{article.readingTime} 分鐘閱讀</span>
      </div>

      {/* 標籤 */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
