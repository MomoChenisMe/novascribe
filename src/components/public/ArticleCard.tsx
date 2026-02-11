import Image from 'next/image';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';

export interface ArticleCardProps {
  post: {
    title: string;
    excerpt: string;
    coverImage: string;
    slug: string;
    publishedAt: string;
    category: {
      name: string;
      slug: string;
    };
  };
}

/**
 * ArticleCard 元件
 * 
 * 文章卡片元件，用於首頁文章列表網格。
 * 
 * Features:
 * - 16:9 縮圖
 * - 標題 (text-xl font-semibold)
 * - 摘要截斷 2 行 (line-clamp-2)
 * - 分類標籤
 * - 發布日期 (YYYY-MM-DD)
 * - Hover 效果 (shadow-md + translate-y-1)
 * 
 * @example
 * ```tsx
 * <ArticleCard
 *   post={{
 *     title: "Next.js 14 新功能",
 *     excerpt: "探索 Next.js 14 帶來的嶄新特性與效能優化...",
 *     coverImage: "/images/nextjs-14.jpg",
 *     slug: "nextjs-14-features",
 *     publishedAt: "2024-02-11T00:00:00.000Z",
 *     category: { name: "技術", slug: "tech" }
 *   }}
 * />
 * ```
 */
export default function ArticleCard({ post }: ArticleCardProps) {
  const formattedDate = new Date(post.publishedAt).toISOString().split('T')[0];

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <Card className="overflow-hidden">
        {/* 縮圖 - 16:9 比例 */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* 內容區 */}
        <div className="p-6">
          {/* 分類標籤 */}
          <div className="mb-3">
            <Tag>{post.category.name}</Tag>
          </div>

          {/* 標題 */}
          <h3 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
            {post.title}
          </h3>

          {/* 摘要 - 截斷 2 行 */}
          <p className="mb-4 line-clamp-2 text-[var(--color-text-secondary)]">
            {post.excerpt}
          </p>

          {/* 發布日期 */}
          <time 
            dateTime={post.publishedAt}
            className="text-sm text-[var(--color-text-muted)]"
          >
            {formattedDate}
          </time>
        </div>
      </Card>
    </Link>
  );
}
