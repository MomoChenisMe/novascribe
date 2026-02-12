import { render, screen } from '@testing-library/react'
import RecentPosts from '../RecentPosts'

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

// Mock Link component
jest.mock('next/link', () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('RecentPosts', () => {
  const mockPosts = [
    {
      id: '1',
      title: '最新文章 1',
      slug: 'recent-1',
      excerpt: '這是最新文章 1 的摘要',
      publishedAt: new Date('2024-01-03'),
      category: { id: '1', name: '技術', slug: 'tech' },
      tags: [],
      readingTime: '5 分鐘',
    },
    {
      id: '2',
      title: '最新文章 2',
      slug: 'recent-2',
      excerpt: '這是最新文章 2 的摘要',
      publishedAt: new Date('2024-01-02'),
      category: { id: '2', name: '生活', slug: 'life' },
      tags: [],
      readingTime: '3 分鐘',
    },
    {
      id: '3',
      title: '最新文章 3',
      slug: 'recent-3',
      excerpt: '這是最新文章 3 的摘要',
      publishedAt: new Date('2024-01-01'),
      category: { id: '1', name: '技術', slug: 'tech' },
      tags: [],
      readingTime: '4 分鐘',
    },
  ]

  it('應該渲染標題', () => {
    render(<RecentPosts posts={mockPosts} />)
    expect(screen.getByRole('heading', { name: /最新文章/i, level: 2 })).toBeInTheDocument()
  })

  it('應該渲染所有最新文章', () => {
    render(<RecentPosts posts={mockPosts} />)
    const articleCards = screen.getAllByTestId('article-card')
    expect(articleCards).toHaveLength(3)
  })

  it('應該顯示每篇文章的標題', () => {
    render(<RecentPosts posts={mockPosts} />)
    expect(screen.getByText('最新文章 1')).toBeInTheDocument()
    expect(screen.getByText('最新文章 2')).toBeInTheDocument()
    expect(screen.getByText('最新文章 3')).toBeInTheDocument()
  })

  it('空陣列時應該顯示提示訊息', () => {
    render(<RecentPosts posts={[]} />)
    expect(screen.getByText(/目前沒有文章/i)).toBeInTheDocument()
  })

  it('應該使用網格佈局', () => {
    const { container } = render(<RecentPosts posts={mockPosts} />)
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).toBeInTheDocument()
  })

  it('有更多文章時應該顯示「查看更多」連結', () => {
    render(<RecentPosts posts={mockPosts} hasMore={true} />)
    const viewMoreLink = screen.getByRole('link', { name: /查看更多/i })
    expect(viewMoreLink).toBeInTheDocument()
    expect(viewMoreLink).toHaveAttribute('href', '/posts')
  })

  it('沒有更多文章時不應該顯示「查看更多」連結', () => {
    render(<RecentPosts posts={mockPosts} hasMore={false} />)
    expect(screen.queryByRole('link', { name: /查看更多/i })).not.toBeInTheDocument()
  })

  it('應該有響應式設計', () => {
    const { container } = render(<RecentPosts posts={mockPosts} />)
    const grid = container.querySelector('[class*="grid"]')
    expect(grid?.className).toMatch(/grid-cols/)
  })

  it('應該允許自訂標題', () => {
    render(<RecentPosts posts={mockPosts} title="熱門文章" />)
    expect(screen.getByRole('heading', { name: '熱門文章', level: 2 })).toBeInTheDocument()
  })

  it('應該允許自訂查看更多連結', () => {
    render(<RecentPosts posts={mockPosts} hasMore={true} viewMoreLink="/archive" />)
    const viewMoreLink = screen.getByRole('link', { name: /查看更多/i })
    expect(viewMoreLink).toHaveAttribute('href', '/archive')
  })
})
