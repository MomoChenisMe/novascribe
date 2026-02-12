import { render, screen } from '@testing-library/react'

import { notFound } from 'next/navigation'
import CategoryPostsPage, { generateMetadata } from '../page'
import * as publicCategoryService from '@/lib/services/public-category.service'
import * as publicPostService from '@/lib/services/public-post.service'
import type { Category, Post, Tag } from '@prisma/client'

jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))
jest.mock('@/lib/services/public-category.service')
jest.mock('@/lib/services/public-post.service')
jest.mock('@/components/public/article/ArticleCard', () => ({
  default: ({ post }: { post: Post }) => <div data-testid={`article-${post.slug}`}>{post.title}</div>
}))
jest.mock('@/components/public/common/Pagination', () => ({
  default: ({ currentPage, totalPages }: any) => (
    <div data-testid="pagination">Page {currentPage}/{totalPages}</div>
  )
}))
jest.mock('@/components/public/common/Breadcrumb', () => ({
  default: ({ items }: any) => <div data-testid="breadcrumb">Breadcrumb: {items.length}</div>
}))

type PostWithRelations = Post & {
  category: Category | null
  tags: Array<{ tag: Tag }>
}

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Tech',
  slug: 'tech',
  description: 'Tech articles',
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockPosts: PostWithRelations[] = [
  {
    id: '1',
    title: 'Post 1',
    slug: 'post-1',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'author-1',
    categoryId: 'cat-1',
    category: mockCategory,
    tags: []
  },
  {
    id: '2',
    title: 'Post 2',
    slug: 'post-2',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-02'),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'author-1',
    categoryId: 'cat-1',
    category: mockCategory,
    tags: []
  }
]

describe('分類文章列表頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('載入分類文章列表', () => {
    it('應該顯示該分類下的所有已發佈文章', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(mockCategory)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: mockPosts,
        total: 2,
        totalPages: 1
      })

      const jsx = await CategoryPostsPage({ params: { slug: 'tech' }, searchParams: {} })
      render(jsx)

      expect(screen.getByText('Tech')).toBeInTheDocument()
      expect(screen.getByTestId('article-post-1')).toBeInTheDocument()
      expect(screen.getByTestId('article-post-2')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    })

    it('應該正確處理分頁參數', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(mockCategory)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [mockPosts[0]],
        total: 20,
        totalPages: 2
      })

      const jsx = await CategoryPostsPage({ params: { slug: 'tech' }, searchParams: { page: '2' } })
      render(jsx)

      expect(publicPostService.getPublishedPosts).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        categorySlug: 'tech'
      })
      expect(screen.getByText(/Page 2\/2/)).toBeInTheDocument()
    })

    it('應該顯示分類描述', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(mockCategory)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: mockPosts,
        total: 2,
        totalPages: 1
      })

      const jsx = await CategoryPostsPage({ params: { slug: 'tech' }, searchParams: {} })
      render(jsx)

      expect(screen.getByText('Tech articles')).toBeInTheDocument()
    })
  })

  describe('分類不存在', () => {
    it('應該回傳 404', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(null)

      await CategoryPostsPage({ params: { slug: 'non-existent' }, searchParams: {} })

      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('分類下無已發佈文章', () => {
    it('應該顯示「此分類目前沒有文章」的提示', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(mockCategory)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [],
        total: 0,
        totalPages: 0
      })

      const jsx = await CategoryPostsPage({ params: { slug: 'tech' }, searchParams: {} })
      render(jsx)

      expect(screen.getByText(/此分類目前沒有文章/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成分類頁 metadata', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(mockCategory)

      const metadata = await generateMetadata({ params: { slug: 'tech' }, searchParams: {} })

      expect(metadata.title).toContain('Tech')
      expect(metadata.description).toBe('Tech articles')
    })

    it('分類不存在時應該回傳預設 metadata', async () => {
      jest.mocked(publicCategoryService.getCategoryBySlug).mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'non-existent' }, searchParams: {} })

      expect(metadata.title).toBe('分類未找到')
    })
  })
})
