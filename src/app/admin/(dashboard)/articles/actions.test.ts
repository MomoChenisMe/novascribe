import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { createArticle, updateArticle } from './actions'
import { prisma } from '@/lib/db'
import * as authUtils from '@/lib/auth-utils'
import * as articlesLib from '@/lib/articles'
import * as versionsLib from '@/lib/versions'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    article: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}))

vi.mock('@/lib/articles', () => ({
  generateSlug: vi.fn(),
  ensureUniqueSlug: vi.fn(),
}))

vi.mock('@/lib/versions', () => ({
  createArticleVersion: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Article Server Actions', () => {
  const mockUser = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'editor',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(authUtils.requireRole as Mock).mockResolvedValue(mockUser)
    ;(articlesLib.generateSlug as Mock).mockImplementation((title: string) => 
      title.toLowerCase().replace(/\s+/g, '-')
    )
    ;(articlesLib.ensureUniqueSlug as Mock).mockResolvedValue('test-article')
    ;(versionsLib.createArticleVersion as Mock).mockResolvedValue(undefined)
  })

  describe('createArticle', () => {
    it('should create article with generated slug', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        status: 'draft',
        authorId: 'user-123',
      }

      ;(prisma.article.create as Mock).mockResolvedValue(mockArticle)

      const input = {
        title: 'Test Article',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'draft',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      }

      const result = await createArticle(input)

      expect(result).toEqual(mockArticle)
      expect(articlesLib.generateSlug).toHaveBeenCalledWith('Test Article')
      expect(articlesLib.ensureUniqueSlug).toHaveBeenCalled()
      expect(prisma.article.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Article',
          slug: 'test-article',
          authorId: 'user-123',
        }),
      })
    })

    it('should set publishedAt when status is published', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Published Article',
        slug: 'published-article',
        status: 'published',
        publishedAt: new Date(),
      }

      ;(prisma.article.create as Mock).mockResolvedValue(mockArticle)

      const input = {
        title: 'Published Article',
        content: 'Content',
        status: 'published',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      }

      await createArticle(input)

      expect(prisma.article.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
        }),
      })
    })

    it('should not set publishedAt for draft articles', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Draft Article',
        slug: 'draft-article',
        status: 'draft',
        publishedAt: null,
      }

      ;(prisma.article.create as Mock).mockResolvedValue(mockArticle)

      const input = {
        title: 'Draft Article',
        content: 'Content',
        status: 'draft',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      }

      await createArticle(input)

      expect(prisma.article.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'draft',
          publishedAt: null,
        }),
      })
    })

    it('should create initial version snapshot', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
      }

      ;(prisma.article.create as Mock).mockResolvedValue(mockArticle)

      const input = {
        title: 'Test Article',
        content: 'Test content',
        status: 'draft',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      }

      await createArticle(input)

      expect(versionsLib.createArticleVersion).toHaveBeenCalledWith(
        'article-123',
        'user-123',
        'Test Article',
        'Test content'
      )
    })

    it('should throw validation error for invalid input', async () => {
      const invalidInput = {
        title: '', // Empty title should fail validation
        content: 'Content',
      }

      await expect(createArticle(invalidInput)).rejects.toThrow()
    })

    it('should require editor or admin role', async () => {
      ;(authUtils.requireRole as Mock).mockRejectedValue(new Error('Unauthorized'))

      const input = {
        title: 'Test Article',
        content: 'Content',
        status: 'draft',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      }

      await expect(createArticle(input)).rejects.toThrow('Unauthorized')
    })
  })

  describe('updateArticle', () => {
    it('should update article and regenerate slug if title changes', async () => {
      const existingArticle = {
        id: 'article-123',
        title: 'Old Title',
        slug: 'old-title',
        content: 'Old content',
        publishedAt: null,
      }

      const updatedArticle = {
        ...existingArticle,
        title: 'New Title',
        slug: 'new-title',
        content: 'New content',
      }

      ;(prisma.article.findUnique as Mock).mockResolvedValue(existingArticle)
      ;(prisma.article.update as Mock).mockResolvedValue(updatedArticle)
      ;(articlesLib.ensureUniqueSlug as Mock).mockResolvedValue('new-title')

      const input = {
        title: 'New Title',
        content: 'New content',
      }

      const result = await updateArticle('article-123', input)

      expect(result.slug).toBe('new-title')
      expect(articlesLib.generateSlug).toHaveBeenCalledWith('New Title')
      expect(articlesLib.ensureUniqueSlug).toHaveBeenCalled()
    })

    it('should keep existing slug if title does not change', async () => {
      const existingArticle = {
        id: 'article-123',
        title: 'Same Title',
        slug: 'same-title',
        content: 'Old content',
        publishedAt: null,
      }

      const updatedArticle = {
        ...existingArticle,
        content: 'New content',
      }

      ;(prisma.article.findUnique as Mock).mockResolvedValue(existingArticle)
      ;(prisma.article.update as Mock).mockResolvedValue(updatedArticle)

      const input = {
        content: 'New content',
      }

      const result = await updateArticle('article-123', input)

      expect(result.slug).toBe('same-title')
      expect(articlesLib.generateSlug).not.toHaveBeenCalled()
    })

    it('should create version snapshot on update', async () => {
      const existingArticle = {
        id: 'article-123',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Old content',
        publishedAt: null,
      }

      const updatedArticle = {
        ...existingArticle,
        content: 'New content',
      }

      ;(prisma.article.findUnique as Mock).mockResolvedValue(existingArticle)
      ;(prisma.article.update as Mock).mockResolvedValue(updatedArticle)

      const input = {
        content: 'New content',
      }

      await updateArticle('article-123', input)

      expect(versionsLib.createArticleVersion).toHaveBeenCalledWith(
        'article-123',
        'user-123',
        'Test Article',
        'New content'
      )
    })

    it('should throw error if article not found', async () => {
      ;(prisma.article.findUnique as Mock).mockResolvedValue(null)

      const input = {
        title: 'New Title',
      }

      await expect(updateArticle('nonexistent-id', input)).rejects.toThrow('Article not found')
    })

    it('should set publishedAt when changing status to published', async () => {
      const existingArticle = {
        id: 'article-123',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content',
        status: 'draft',
        publishedAt: null,
      }

      ;(prisma.article.findUnique as Mock).mockResolvedValue(existingArticle)
      ;(prisma.article.update as Mock).mockResolvedValue({
        ...existingArticle,
        status: 'published',
        publishedAt: expect.any(Date),
      })

      const input = {
        status: 'published',
      }

      await updateArticle('article-123', input)

      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 'article-123' },
        data: expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
        }),
      })
    })

    it('should preserve existing publishedAt if already published', async () => {
      const publishedDate = new Date('2024-01-01')
      const existingArticle = {
        id: 'article-123',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content',
        status: 'published',
        publishedAt: publishedDate,
      }

      ;(prisma.article.findUnique as Mock).mockResolvedValue(existingArticle)
      ;(prisma.article.update as Mock).mockResolvedValue({
        ...existingArticle,
        content: 'Updated content',
      })

      const input = {
        content: 'Updated content',
      }

      await updateArticle('article-123', input)

      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 'article-123' },
        data: expect.objectContaining({
          publishedAt: publishedDate,
        }),
      })
    })
  })
})
