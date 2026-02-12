import Image from 'next/image';
import Link from 'next/link';

export interface VisualGridProps {
  posts: {
    title: string;
    excerpt: string;
    coverImage: string;
    slug: string;
    publishedAt: string;
    category: {
      name: string;
      slug: string;
    };
  }[];
}

/**
 * VisualGrid — 3 欄式文章卡片網格
 * Mobile: 1 欄, Tablet: 2 欄, Desktop: 3 欄
 */
export const VisualGrid = ({ posts }: VisualGridProps) => {
  if (posts.length === 0) {
    return (
      <p className="text-text-muted text-center py-12">
        暫無更多文章
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => {
        const formattedDate = new Date(post.publishedAt)
          .toISOString()
          .split('T')[0];

        return (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <article className="bg-bg-card border border-border-light rounded-lg overflow-hidden transition-shadow hover:shadow-md">
              {/* Cover Image */}
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {post.category.name}
                </span>
                <h3 className="mt-2 text-lg font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                  {post.excerpt}
                </p>
                <time
                  dateTime={post.publishedAt}
                  className="mt-3 block text-xs text-text-muted"
                >
                  {formattedDate}
                </time>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
};
