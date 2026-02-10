import { render, screen } from '@testing-library/react'

import { notFound } from 'next/navigation'
import TagPostsPage, { generateMetadata } from '../page'
import * as publicTagService from '@/lib/services/public-tag.service'
import * as publicPostService from '@/lib/services/public-post.service'
import type { Tag, Post, Category } from '@prisma/client'

jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))
jest.mock('@/lib/services/public-tag.service')
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

const mockTag: Tag = {
  id: 'tag-1',
  name: 'JavaScript',
  slug: 'javascript',
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockPosts: PostWithRelations[] = [
  {
    id: '1',
    title: 'JS Post 1',
    slug: 'js-post-1',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'author-1',
    categoryId: 'cat-1',
    category: null,
    tags: [{ tag: mockTag }]
  },
  {
    id: '2',
    title: 'JS Post 2',
    slug: 'js-post-2',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-02'),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'author-1',
    categoryId: 'cat-1',
    category: null,
    tags: [{ tag: mockTag }]
  }
]

describe('標籤文章列表頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('載入標籤文章列表', () => {
    it('應該顯示該標籤下的所有已發佈文章', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(mockTag)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: mockPosts,
        total: 2,
        totalPages: 1
      })

      const jsx = await TagPostsPage({ params: { slug: 'javascript' }, searchParams: {} })
      render(jsx)

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByTestId('article-js-post-1')).toBeInTheDocument()
      expect(screen.getByTestId('article-js-post-2')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    })

    it('應該正確處理分頁參數', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(mockTag)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [mockPosts[0]],
        total: 20,
        totalPages: 2
      })

      const jsx = await TagPostsPage({ params: { slug: 'javascript' }, searchParams: { page: '2' } })
      render(jsx)

      expect(publicPostService.getPublishedPosts).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        tagSlug: 'javascript'
      })
      expect(screen.getByText(/Page 2\/2/)).toBeInTheDocument()
    })
  })

  describe('標籤不存在', () => {
    it('應該回傳 404', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(null)

      await TagPostsPage({ params: { slug: 'non-existent' }, searchParams: {} })

      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('標籤下無已發佈文章', () => {
    it('應該顯示「此標籤目前沒有文章」的提示', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(mockTag)
      jest.mocked(publicPostService.getPublishedPosts).mockResolvedValue({
        posts: [],
        total: 0,
        totalPages: 0
      })

      const jsx = await TagPostsPage({ params: { slug: 'javascript' }, searchParams: {} })
      render(jsx)

      expect(screen.getByText(/此標籤目前沒有文章/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成標籤頁 metadata', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(mockTag)

      const metadata = await generateMetadata({ params: { slug: 'javascript' }, searchParams: {} })

      expect(metadata.title).toContain('JavaScript')
      expect(metadata.description).toContain('JavaScript')
    })

    it('標籤不存在時應該回傳預設 metadata', async () => {
      jest.mocked(publicTagService.getTagBySlug).mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'non-existent' }, searchParams: {} })

      expect(metadata.title).toBe('標籤未找到')
    })
  })
})
