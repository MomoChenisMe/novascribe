import Link from 'next/link'

interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
}

interface TagCloudProps {
  tags: Tag[]
  title?: string
  maxTags?: number
  showCount?: boolean
}

export default function TagCloud({
  tags,
  title = '標籤雲',
  maxTags = 30,
  showCount = false,
}: TagCloudProps) {
  // 按文章數降序排列並限制數量
  const sortedTags = [...tags]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, maxTags)

  if (sortedTags.length === 0) {
    return (
      <div className="py-6">
        <h3 className="text-xl font-bold text-text mb-4">{title}</h3>
        <p className="text-secondary text-sm">目前沒有標籤</p>
      </div>
    )
  }

  // 計算字體大小：根據文章數分成 5 個等級
  const maxCount = Math.max(...sortedTags.map((tag) => tag.postCount))
  const minCount = Math.min(...sortedTags.map((tag) => tag.postCount))

  const getFontSizeClass = (count: number) => {
    if (maxCount === minCount) return 'text-base'
    
    const ratio = (count - minCount) / (maxCount - minCount)
    if (ratio > 0.8) return 'text-xl font-semibold'
    if (ratio > 0.6) return 'text-lg font-medium'
    if (ratio > 0.4) return 'text-base font-medium'
    if (ratio > 0.2) return 'text-sm'
    return 'text-xs'
  }

  return (
    <div className="py-6">
      <h3 className="text-xl font-bold text-text mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {sortedTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={`inline-block px-3 py-1 bg-secondary/10 hover:bg-primary/10 text-secondary hover:text-primary rounded-full transition-all hover:scale-105 ${getFontSizeClass(tag.postCount)}`}
          >
            #{tag.name}
            {showCount && (
              <span className="ml-1 text-xs opacity-70">({tag.postCount})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
