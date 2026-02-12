import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

interface PopularPost {
  id: string;
  title: string;
  slug: string;
}

interface SidebarProps {
  categories: Category[];
  tags: Tag[];
  popularPosts: PopularPost[];
}

/**
 * Sidebar 元件
 * 顯示分類列表、標籤雲、熱門文章
 */
export default function Sidebar({ categories, tags, popularPosts }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* 分類列表 */}
      <section>
        <h2 className="text-xl font-bold mb-4">分類</h2>
        {categories.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">暫無分類</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span>{category.name}</span>
                  {category._count && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({category._count.posts})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 標籤雲 */}
      <section>
        <h2 className="text-xl font-bold mb-4">標籤</h2>
        {tags.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">暫無標籤</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors text-sm"
              >
                {tag.name}
                {tag._count && (
                  <span className="ml-1 text-xs opacity-75">
                    {tag._count.posts}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 熱門文章 */}
      <section>
        <h2 className="text-xl font-bold mb-4">熱門文章</h2>
        {popularPosts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">暫無熱門文章</p>
        ) : (
          <ul className="space-y-3">
            {popularPosts.map((post, index) => (
              <li key={post.id} className="flex items-start gap-3">
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-700 min-w-[2rem]">
                  {index + 1}
                </span>
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-primary transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
