import { render, screen } from '@testing-library/react'

import { notFound } from 'next/navigation'
import PostPage, { generateMetadata } from '../page'
import * as publicPostService from '@/lib/services/public-post.service'
import * as markdownLib from '@/lib/markdown'
import type { Post, Category, Tag, SeoMetadata } from '@prisma/client'

jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))
jest.mock('@/lib/services/public-post.service')
jest.mock('@/lib/markdown')
jest.mock('@/components/public/article/ArticleHeader', () => ({
  default: ({ post }: { post: Post }) => <div data-testid="article-header">{post.title}</div>
}))
jest.mock('@/components/public/article/ArticleContent', () => ({
  default: ({ html }: { html: string }) => <div data-testid="article-content" dangerouslySetInnerHTML={{ __html: html }} />
}))
jest.mock('@/components/public/article/ArticleToc', () => ({
  default: ({ toc }: any) => <div data-testid="article-toc">TOC: {toc.length}</div>
}))
jest.mock('@/components/public/article/RelatedPosts', () => ({
  default: ({ posts }: { posts: Post[] }) => <div data-testid="related-posts">Related: {posts.length}</div>
}))
jest.mock('@/components/public/article/ShareButtons', () => ({
  default: ({ url, title }: any) => <div data-testid="share-buttons">{title}</div>
}))
jest.mock('@/components/public/common/Breadcrumb', () => ({
  default: ({ items }: any) => <div data-testid="breadcrumb">Breadcrumb: {items.length}</div>
}))

type PostWithRelations = Post & {
  category: Category | null
  tags: Array<{ tag: Tag }>
  seoMetadata: SeoMetadata | null
}

const mockPost: PostWithRelations = {
  id: '1',
  title: 'Test Article',
  slug: 'test-article',
  content: '## Heading 1\n\nContent here.\n\n## Heading 2\n\nMore content.',
  excerpt: 'Test excerpt',
  featuredImage: '/test-image.jpg',
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
  tags: [
    {
      tag: {
        id: 'tag-1',
        name: 'JavaScript',
        slug: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  seoMetadata: {
    id: 'seo-1',
    entityType: 'POST',
    entityId: '1',
    metaTitle: 'SEO Title',
    metaDescription: 'SEO Description',
    ogTitle: 'OG Title',
    ogDescription: 'OG Description',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://example.com/test-article',
    noIndex: false,
    noFollow: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const mockRelatedPosts: Post[] = [
  {
    id: '2',
    title: 'Related Post 1',
    slug: 'related-1',
    content: 'Content',
    excerpt: 'Related excerpt',
    featuredImage: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-02'),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'author-1',
    categoryId: 'cat-1'
  }
]

const mockToc = [
  { id: 'heading-1', text: 'Heading 1', level: 2 },
  { id: 'heading-2', text: 'Heading 2', level: 2 }
]

describe('文章頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('載入已發佈文章', () => {
    it('應該顯示文章完整內容、標題、目錄、相關文章和分享按鈕', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(mockPost)
      jest.mocked(publicPostService.getRelatedPosts).mockResolvedValue(mockRelatedPosts)
      jest.mocked(markdownLib.renderMarkdown).mockResolvedValue('<div>Rendered HTML</div>')
      jest.mocked(markdownLib.extractToc).mockReturnValue(mockToc)

      const jsx = await PostPage({ params: { slug: 'test-article' } })
      render(jsx)

      expect(screen.getByTestId('article-header')).toBeInTheDocument()
      expect(screen.getByTestId('article-content')).toBeInTheDocument()
      expect(screen.getByTestId('article-toc')).toBeInTheDocument()
      expect(screen.getByTestId('related-posts')).toBeInTheDocument()
      expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    })

    it('應該呼叫 markdown 渲染與目錄生成', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(mockPost)
      jest.mocked(publicPostService.getRelatedPosts).mockResolvedValue(mockRelatedPosts)
      jest.mocked(markdownLib.renderMarkdown).mockResolvedValue('<div>Rendered HTML</div>')
      jest.mocked(markdownLib.extractToc).mockReturnValue(mockToc)

      await PostPage({ params: { slug: 'test-article' } })

      expect(markdownLib.renderMarkdown).toHaveBeenCalledWith(mockPost.content)
      expect(markdownLib.extractToc).toHaveBeenCalledWith(mockPost.content)
    })

    it('應該載入相關文章', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(mockPost)
      jest.mocked(publicPostService.getRelatedPosts).mockResolvedValue(mockRelatedPosts)
      jest.mocked(markdownLib.renderMarkdown).mockResolvedValue('<div>Rendered HTML</div>')
      jest.mocked(markdownLib.extractToc).mockReturnValue(mockToc)

      await PostPage({ params: { slug: 'test-article' } })

      expect(publicPostService.getRelatedPosts).toHaveBeenCalledWith('1', 3)
    })
  })

  describe('存取未發佈文章', () => {
    it('應該回傳 404', async () => {
      const draftPost = { ...mockPost, status: 'DRAFT' as const }
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(draftPost)

      await PostPage({ params: { slug: 'test-article' } })

      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('存取不存在的文章', () => {
    it('應該回傳 404', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(null)

      await PostPage({ params: { slug: 'non-existent' } })

      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('generateMetadata', () => {
    it('應該使用 SeoMetadata 優先生成 metadata', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(mockPost)

      const metadata = await generateMetadata({ params: { slug: 'test-article' } })

      expect(metadata.title).toBe('SEO Title')
      expect(metadata.description).toBe('SEO Description')
      expect(metadata.openGraph?.title).toBe('OG Title')
      expect(metadata.openGraph?.description).toBe('OG Description')
      expect(metadata.openGraph?.images).toEqual([{ url: '/og-image.jpg' }])
      expect(metadata.openGraph?.type).toBe('article')
      expect(metadata.twitter?.card).toBe('summary_large_image')
      expect(metadata.alternates?.canonical).toBe('https://example.com/test-article')
      expect(metadata.robots).toEqual({ index: true, follow: true })
    })

    it('沒有 SeoMetadata 時應該 fallback 文章欄位', async () => {
      const postWithoutSeo = { ...mockPost, seoMetadata: null }
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(postWithoutSeo)

      const metadata = await generateMetadata({ params: { slug: 'test-article' } })

      expect(metadata.title).toBe('Test Article')
      expect(metadata.description).toBe('Test excerpt')
    })

    it('文章不存在時應該回傳預設 metadata', async () => {
      jest.mocked(publicPostService.getPostBySlug).mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'non-existent' } })

      expect(metadata.title).toBe('文章未找到')
    })
  })
})
