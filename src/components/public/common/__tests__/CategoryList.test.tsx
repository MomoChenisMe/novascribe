import { render, screen } from '@testing-library/react'
import CategoryList from '../CategoryList'

// Mock Link component
jest.mock('next/link', () => {
  return function Link({ children, href, className }: any) {
    return <a href={href} className={className}>{children}</a>
  }
})

describe('CategoryList', () => {
  const mockCategories = [
    {
      id: '1',
      name: '技術',
      slug: 'tech',
      description: '技術相關文章',
      _count: { posts: 15 },
    },
    {
      id: '2',
      name: '生活',
      slug: 'life',
      description: '生活點滴',
      _count: { posts: 8 },
    },
    {
      id: '3',
      name: '旅遊',
      slug: 'travel',
      description: '旅遊遊記',
      _count: { posts: 5 },
    },
  ]

  it('應該渲染標題', () => {
    render(<CategoryList categories={mockCategories} />)
    expect(screen.getByRole('heading', { name: /分類列表/i, level: 3 })).toBeInTheDocument()
  })

  it('應該渲染所有分類', () => {
    render(<CategoryList categories={mockCategories} />)
    mockCategories.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  it('每個分類應該是連結', () => {
    render(<CategoryList categories={mockCategories} />)
    mockCategories.forEach((category) => {
      const link = screen.getByRole('link', { name: new RegExp(category.name) })
      expect(link).toHaveAttribute('href', `/categories/${category.slug}`)
    })
  })

  it('應該顯示分類描述', () => {
    render(<CategoryList categories={mockCategories} showDescription={true} />)
    mockCategories.forEach((category) => {
      expect(screen.getByText(category.description!)).toBeInTheDocument()
    })
  })

  it('應該顯示文章數量', () => {
    render(<CategoryList categories={mockCategories} />)
    expect(screen.getByText('15 篇')).toBeInTheDocument()
    expect(screen.getByText('8 篇')).toBeInTheDocument()
    expect(screen.getByText('5 篇')).toBeInTheDocument()
  })

  it('空陣列時應該顯示提示訊息', () => {
    render(<CategoryList categories={[]} />)
    expect(screen.getByText(/目前沒有分類/i)).toBeInTheDocument()
  })

  it('應該使用列表佈局', () => {
    const { container } = render(<CategoryList categories={mockCategories} />)
    const list = container.querySelector('ul') || container.querySelector('[role="list"]')
    expect(list).toBeInTheDocument()
  })

  it('應該允許自訂標題', () => {
    render(<CategoryList categories={mockCategories} title="文章分類" />)
    expect(screen.getByRole('heading', { name: '文章分類', level: 3 })).toBeInTheDocument()
  })

  it('不顯示描述時應該隱藏描述', () => {
    render(<CategoryList categories={mockCategories} showDescription={false} />)
    expect(screen.queryByText(mockCategories[0].description!)).not.toBeInTheDocument()
  })

  it('分類應該按文章數降序排列', () => {
    render(<CategoryList categories={mockCategories} />)
    const links = screen.getAllByRole('link')
    
    // 第一個應該是技術 (15 篇)
    expect(links[0]).toHaveTextContent('技術')
    // 最後一個應該是旅遊 (5 篇)
    expect(links[links.length - 1]).toHaveTextContent('旅遊')
  })

  it('應該有 hover 效果樣式', () => {
    const { container } = render(<CategoryList categories={mockCategories} />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThan(0)
    
    // 檢查是否有 hover 相關的 class
    const hasHoverClass = Array.from(links).some(link => /hover/.test(link.className))
    expect(hasHoverClass).toBe(true)
  })
})
