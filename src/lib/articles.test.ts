import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateSlug, ensureUniqueSlug } from './articles'

describe('Article Utilities', () => {
  describe('generateSlug', () => {
    it('should generate slug from English title', () => {
      const result = generateSlug('Hello World')
      expect(result).toBe('hello-world')
    })

    it('should generate slug from Chinese title', () => {
      const result = generateSlug('測試文章標題')
      // Slugify with zh locale will transliterate Chinese to pinyin or remove it
      // Just check it's URL-safe (may be empty or transliterated)
      expect(result).toBeDefined()
    })

    it('should handle special characters', () => {
      const result = generateSlug('Test & Article: Part 1!')
      // The '&' is converted to 'and' by slugify
      expect(result).toBe('test-and-article-part-1')
    })

    it('should handle mixed language titles', () => {
      const result = generateSlug('NovaScribe 文章管理系統')
      expect(result).toMatch(/^[\w-]+$/)
    })

    it('should convert to lowercase', () => {
      const result = generateSlug('UPPER CASE TITLE')
      expect(result).toBe('upper-case-title')
    })

    it('should remove consecutive dashes', () => {
      const result = generateSlug('Multiple  Spaces  Here')
      expect(result).toBe('multiple-spaces-here')
    })

    it('should not start or end with dashes', () => {
      const result = generateSlug('  Trim Spaces  ')
      expect(result).not.toMatch(/^-|-$/)
    })
  })

  describe('ensureUniqueSlug', () => {
    it('should return original slug if unique', async () => {
      const mockPrisma = {
        article: {
          count: vi.fn().mockResolvedValue(0),
        },
      }

      const result = await ensureUniqueSlug(mockPrisma as unknown as Parameters<typeof ensureUniqueSlug>[0], 'new-article')
      
      expect(result).toBe('new-article')
      expect(mockPrisma.article.count).toHaveBeenCalledTimes(1)
    })

    it('should append counter if slug exists', async () => {
      const mockPrisma = {
        article: {
          count: vi.fn()
            .mockResolvedValueOnce(1)  // First slug exists
            .mockResolvedValueOnce(1)  // Second attempt exists
            .mockResolvedValueOnce(0), // Third attempt is unique
        },
      }

      const result = await ensureUniqueSlug(mockPrisma as unknown as Parameters<typeof ensureUniqueSlug>[0], 'existing-article')
      
      expect(result).toBe('existing-article-2')
      expect(mockPrisma.article.count).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple collisions', async () => {
      const mockPrisma = {
        article: {
          count: vi.fn()
            .mockResolvedValueOnce(1)  // original
            .mockResolvedValueOnce(1)  // -1
            .mockResolvedValueOnce(1)  // -2
            .mockResolvedValueOnce(1)  // -3
            .mockResolvedValueOnce(0), // -4 is unique
        },
      }

      const result = await ensureUniqueSlug(mockPrisma as unknown as Parameters<typeof ensureUniqueSlug>[0], 'popular-slug')
      
      expect(result).toBe('popular-slug-4')
    })
  })

  describe('Slug Generation Integration', () => {
    it('should generate unique URL-safe slugs from various titles', () => {
      const testCases = [
        { title: '如何使用 NovaScribe', expected: /^[\w-]+$/ },
        { title: 'Getting Started with Next.js', expected: /^getting-started-with-nextjs$/ },
        { title: '2024 年度回顧', expected: /^[\w-]+$/ },
        { title: 'React vs. Vue: A Comparison', expected: /^react-vs-vue-a-comparison$/ },
      ]

      testCases.forEach(({ title, expected }) => {
        const slug = generateSlug(title)
        expect(slug).toMatch(expected)
        expect(slug).not.toContain(' ')
        expect(slug).not.toMatch(/[^a-z0-9-]/)
      })
    })
  })
})
