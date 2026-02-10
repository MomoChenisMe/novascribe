import { render, screen } from '@testing-library/react'
import FeaturedPosts from '../FeaturedPosts'

// Mock ArticleCard component
jest.mock('@/components/public/article/ArticleCard', () => {
  return function ArticleCard({ post }: any) {
    return (
      <div data-testid="article-card">
        <h3>{post.title}</h3>
      </div>
    )
  }
})

describe('FeaturedPosts', () => {
  const mockPosts = [
    {
      id: '1',
      title: '精選文章 1',
      slug: 'featured-1',
      excerpt: '這是精選文章 1 的摘要',
      coverImage: '/images/featured-1.jpg',
      publishedAt: new Date('2024-01-01'),
      category: { id: '1', name: '技術', slug: 'tech' },
      tags: [{ tag: { id: '1', name: 'JavaScript', slug: 'javascript' } }],
      readingTime: '5 分鐘',
    },
    {
      id: '2',
      title: '精選文章 2',
      slug: 'featured-2',
      excerpt: '這是精選文章 2 的摘要',
      coverImage: '/images/featured-2.jpg',
      publishedAt: new Date('2024-01-02'),
      category: { id: '2', name: '生活', slug: 'life' },
      tags: [{ tag: { id: '2', name: 'React', slug: 'react' } }],
      readingTime: '3 分鐘',
    },
  ]

  it('應該渲染標題', () => {
    render(<FeaturedPosts posts={mockPosts} />)
    expect(screen.getByRole('heading', { name: /精選文章/i, level: 2 })).toBeInTheDocument()
  })

  it('應該渲染所有精選文章', () => {
    render(<FeaturedPosts posts={mockPosts} />)
    const articleCards = screen.getAllByTestId('article-card')
    expect(articleCards).toHaveLength(2)
  })

  it('應該顯示每篇文章的標題', () => {
    render(<FeaturedPosts posts={mockPosts} />)
    expect(screen.getByText('精選文章 1')).toBeInTheDocument()
    expect(screen.getByText('精選文章 2')).toBeInTheDocument()
  })

  it('空陣列時不應該渲染任何內容', () => {
    const { container } = render(<FeaturedPosts posts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('應該使用網格佈局', () => {
    const { container } = render(<FeaturedPosts posts={mockPosts} />)
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).toBeInTheDocument()
  })

  it('應該最多顯示 3 篇文章', () => {
    const manyPosts = [
      ...mockPosts,
      {
        id: '3',
        title: '精選文章 3',
        slug: 'featured-3',
        excerpt: '這是精選文章 3 的摘要',
        coverImage: '/images/featured-3.jpg',
        publishedAt: new Date('2024-01-03'),
        category: { id: '1', name: '技術', slug: 'tech' },
        tags: [],
        readingTime: '4 分鐘',
      },
      {
        id: '4',
        title: '精選文章 4',
        slug: 'featured-4',
        excerpt: '這是精選文章 4 的摘要',
        coverImage: '/images/featured-4.jpg',
        publishedAt: new Date('2024-01-04'),
        category: { id: '1', name: '技術', slug: 'tech' },
        tags: [],
        readingTime: '6 分鐘',
      },
    ]

    render(<FeaturedPosts posts={manyPosts} />)
    const articleCards = screen.getAllByTestId('article-card')
    expect(articleCards).toHaveLength(3)
  })

  it('應該有響應式設計', () => {
    const { container } = render(<FeaturedPosts posts={mockPosts} />)
    const grid = container.querySelector('[class*="grid"]')
    expect(grid?.className).toMatch(/grid-cols/)
  })

  it('應該允許自訂標題', () => {
    render(<FeaturedPosts posts={mockPosts} title="熱門文章" />)
    expect(screen.getByText('熱門文章')).toBeInTheDocument()
  })
})
