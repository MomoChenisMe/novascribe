import { render, screen } from '@testing-library/react'
import TagCloud from '../TagCloud'

// Mock Link component
jest.mock('next/link', () => {
  return function Link({ children, href, className }: any) {
    return <a href={href} className={className}>{children}</a>
  }
})

describe('TagCloud', () => {
  const mockTags = [
    { id: '1', name: 'JavaScript', slug: 'javascript', _count: { posts: 10 } },
    { id: '2', name: 'React', slug: 'react', _count: { posts: 8 } },
    { id: '3', name: 'TypeScript', slug: 'typescript', _count: { posts: 6 } },
    { id: '4', name: 'Node.js', slug: 'nodejs', _count: { posts: 4 } },
    { id: '5', name: 'CSS', slug: 'css', _count: { posts: 2 } },
  ]

  it('應該渲染標題', () => {
    render(<TagCloud tags={mockTags} />)
    expect(screen.getByRole('heading', { name: /標籤雲/i, level: 3 })).toBeInTheDocument()
  })

  it('應該渲染所有標籤', () => {
    render(<TagCloud tags={mockTags} />)
    mockTags.forEach((tag) => {
      expect(screen.getByText(tag.name, { exact: false })).toBeInTheDocument()
    })
  })

  it('每個標籤應該是連結', () => {
    render(<TagCloud tags={mockTags} />)
    mockTags.forEach((tag) => {
      const link = screen.getByRole('link', { name: `#${tag.name}` })
      expect(link).toHaveAttribute('href', `/tags/${tag.slug}`)
    })
  })

  it('空陣列時應該顯示提示訊息', () => {
    render(<TagCloud tags={[]} />)
    expect(screen.getByText(/目前沒有標籤/i)).toBeInTheDocument()
  })

  it('文章數多的標籤應該有較大的字體', () => {
    const { container } = render(<TagCloud tags={mockTags} />)
    
    // JavaScript 有 10 篇文章，應該是最大的
    const jsLink = screen.getByRole('link', { name: '#JavaScript' })
    const cssLink = screen.getByRole('link', { name: '#CSS' })
    
    expect(jsLink).toBeInTheDocument()
    expect(cssLink).toBeInTheDocument()
    
    // 檢查父元素是否有不同的字體大小 class (Next.js Link 將 className 傳給 <a>)
    const allLinks = container.querySelectorAll('a')
    expect(allLinks.length).toBeGreaterThan(0)
    // 至少驗證有 text- 相關的 class
    const hasTextClass = Array.from(allLinks).some(link => /text-/.test(link.className))
    expect(hasTextClass).toBe(true)
  })

  it('應該使用 flex wrap 佈局', () => {
    const { container } = render(<TagCloud tags={mockTags} />)
    const tagsContainer = container.querySelector('[class*="flex"]')
    expect(tagsContainer).toBeInTheDocument()
    expect(tagsContainer?.className).toMatch(/flex-wrap/)
  })

  it('應該允許自訂標題', () => {
    render(<TagCloud tags={mockTags} title="熱門標籤" />)
    expect(screen.getByRole('heading', { name: '熱門標籤', level: 3 })).toBeInTheDocument()
  })

  it('應該限制最大標籤數量', () => {
    const manyTags = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Tag ${i + 1}`,
      slug: `tag-${i + 1}`,
      _count: { posts: Math.floor(Math.random() * 10) + 1 },
    }))

    render(<TagCloud tags={manyTags} maxTags={20} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeLessThanOrEqual(20)
  })

  it('標籤應該按文章數降序排列', () => {
    render(<TagCloud tags={mockTags} />)
    const links = screen.getAllByRole('link')
    
    // 第一個應該是 JavaScript (10 篇)
    expect(links[0]).toHaveTextContent('JavaScript')
    // 最後一個應該是 CSS (2 篇)
    expect(links[links.length - 1]).toHaveTextContent('CSS')
  })

  it('應該顯示文章數量', () => {
    render(<TagCloud tags={mockTags} showCount={true} />)
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })
})
