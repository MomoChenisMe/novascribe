import Image from 'next/image';
import Link from 'next/link';

export interface FeaturedHeroProps {
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
 * FeaturedHero — 首頁大圖 Hero
 * 最新一篇文章以全寬大圖呈現，標題與摘要覆蓋於圖片上。
 */
export const FeaturedHero = ({ post }: FeaturedHeroProps) => {
  const formattedDate = new Date(post.publishedAt).toISOString().split('T')[0];

  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <section className="relative w-full aspect-[21/9] sm:aspect-[2/1] lg:aspect-[21/9] overflow-hidden bg-neutral-900">
        {/* Background Image */}
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <span className="inline-block text-xs font-medium uppercase tracking-wider text-white/80 mb-3">
            {post.category.name}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl leading-tight">
            {post.title}
          </h1>
          <p className="text-sm sm:text-base text-white/70 mb-4 max-w-2xl line-clamp-2">
            {post.excerpt}
          </p>
          <time dateTime={post.publishedAt} className="text-xs text-white/50">
            {formattedDate}
          </time>
        </div>
      </section>
    </Link>
  );
};
