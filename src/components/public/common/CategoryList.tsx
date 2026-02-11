import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  postCount: number
}

interface CategoryListProps {
  categories: Category[]
  title?: string
  showDescription?: boolean
}

export default function CategoryList({
  categories,
  title = '分類列表',
  showDescription = false,
}: CategoryListProps) {
  // 按文章數降序排列
  const sortedCategories = [...categories].sort(
    (a, b) => b.postCount - a.postCount
  )

  if (sortedCategories.length === 0) {
    return (
      <div className="py-6">
        <h3 className="text-xl font-bold text-text mb-4">{title}</h3>
        <p className="text-secondary text-sm">目前沒有分類</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h3 className="text-xl font-bold text-text mb-4">{title}</h3>
      <ul className="space-y-3">
        {sortedCategories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border rounded-lg transition-all hover:shadow-md group"
            >
              <div className="flex-1">
                <div className="font-medium text-text group-hover:text-primary transition-colors">
                  {category.name}
                </div>
                {showDescription && category.description && (
                  <div className="text-sm text-secondary mt-1">
                    {category.description}
                  </div>
                )}
              </div>
              <span className="text-sm text-secondary ml-4">
                {category.postCount} 篇
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
