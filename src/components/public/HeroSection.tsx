import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  post: {
    title: string;
    excerpt: string;
    coverImage: string;
    slug: string;
    publishedAt: string;
  };
}

/**
 * Hero Section 元件
 * 
 * 展示最新或精選文章的 Hero Section，支援響應式佈局：
 * - Desktop (>=768px): 左圖右文 50/50 比例
 * - Mobile (<768px): 上圖下文垂直堆疊
 * 
 * @example
 * ```tsx
 * <HeroSection post={{
 *   title: "文章標題",
 *   excerpt: "文章摘要...",
 *   coverImage: "/images/cover.jpg",
 *   slug: "article-slug",
 *   publishedAt: "2026-02-11"
 * }} />
 * ```
 */
export default function HeroSection({ post }: HeroSectionProps) {
  const { title, excerpt, coverImage, slug } = post;

  return (
    <section className="w-full bg-stone-50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Desktop: 左圖右文 (Flexbox 50/50) | Mobile: 上圖下文 (垂直堆疊) */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* 圖片區塊 - 50% */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* 文字區塊 - 50% */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-stone-900 mb-4 leading-tight">
              {title}
            </h1>
            
            <p className="text-stone-600 text-lg mb-6 leading-relaxed line-clamp-3">
              {excerpt}
            </p>

            <div>
              <Link href={`/posts/${slug}`}>
                <Button variant="primary">
                  閱讀更多
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
