import { render, screen } from '@testing-library/react'
import HomePage, { generateMetadata } from '../page'
import * as publicPostService from '@/lib/services/public-post.service'
import * as publicCategoryService from '@/lib/services/public-category.service'
import type { Post, Category, Tag } from '@prisma/client'

jest.mock('@/lib/services/public-post.service')
jest.mock('@/lib/services/public-category.service')
jest.mock('@/components/public/home/HeroSection', () => ({
  default: ({ post }: { post: Post }) => <div data-testid="hero-section">{post.title}</div>
}))
jest.mock('@/components/public/home/FeaturedPosts', () => ({
  default: ({ posts }: { posts: Post[] }) => (
    <div data-testid="featured-posts">Featured: {posts.length}</div>
  )
}))
jest.mock('@/components/public/home/RecentPosts', () => ({
  default: ({ posts, totalPages, currentPage }: any) => (
    <div data-testid="recent-posts">
      Recent: {posts.length}, Page {currentPage}/{totalPages}
    </div>
  )
}))
jest.mock('@/components/public/common/CategoryList', () => ({
  default: ({ categories }: { categories: Category[] }) => (
    <div data-testid="category-list">Categories: {categories.length}</div>
  )
}))

type PostWithRelations = Post & {
  category: Category | null
  tags: Array<{ tag: Tag }>
  _count?: { tags: number }
}

const mockPost: PostWithRelations = {
  id: '1',
  title: 'Test Post',
  slug: 'test-post',
  content: 'Test content',
  excerpt: 'Test excerpt',
  featuredImage: null,
  status: 'PUBLISHED',
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: 'author-1',
  categoryId: 'cat-1',
  category: {
    id: 'cat-1',
    name: 'Tech',
    slug: 'tech',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  tags: [],
  _count: { tags: 0 }
}

const mockCategory: Category & { _count?: { posts: number } } = {
  id: 'cat-1',
  name: 'Tech',
  slug: 'tech',
  description: 'Tech articles',
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { posts: 5 }
}

describe('首頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('文章列表渲染', () => {
    it('應該顯示已發佈文章列表、精選文章和分類導航', async () => {
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [mockPost, { ...mockPost, id: '2', title: 'Post 2', slug: 'post-2' }],
        total: 2,
        totalPages: 1
      })
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue([mockCategory])

      const jsx = await HomePage({ searchParams: { page: '1' } })
      render(jsx)

      expect(screen.getByTestId('hero-section')).toBeInTheDocument()
      expect(screen.getByTestId('featured-posts')).toBeInTheDocument()
      expect(screen.getByTestId('recent-posts')).toBeInTheDocument()
      expect(screen.getByTestId('category-list')).toBeInTheDocument()
    })

    it('應該正確處理分頁參數', async () => {
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [mockPost],
        total: 20,
        totalPages: 2
      })
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue([mockCategory])

      const jsx = await HomePage({ searchParams: { page: '2' } })
      render(jsx)

      expect(publicPostService.getPublishedPosts).toHaveBeenCalledWith({
        page: 2,
        limit: 10
      })
      expect(screen.getByText(/Page 2\/2/)).toBeInTheDocument()
    })

    it('無頁碼參數時應該預設第 1 頁', async () => {
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [mockPost],
        total: 1,
        totalPages: 1
      })
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue([mockCategory])

      await HomePage({ searchParams: {} })

      expect(publicPostService.getPublishedPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      })
    })
  })

  describe('無已發佈文章', () => {
    it('應該顯示「目前沒有文章」的提示訊息', async () => {
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [],
        total: 0,
        totalPages: 0
      })
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue([])

      const jsx = await HomePage({ searchParams: {} })
      render(jsx)

      expect(screen.getByText(/目前沒有文章/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成首頁 metadata', async () => {
      const metadata = await generateMetadata({ searchParams: {} })

      expect(metadata).toMatchObject({
        title: expect.stringContaining('NovaScribe'),
        description: expect.any(String)
      })
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.type).toBe('website')
    })

    it('分頁頁面應該在標題中包含頁碼', async () => {
      const metadata = await generateMetadata({ searchParams: { page: '2' } })

      expect(metadata.title).toContain('頁 2')
    })
  })
})
