import { render, screen } from '@testing-library/react'

import CategoriesPage, { generateMetadata } from '../page'
import * as publicCategoryService from '@/lib/services/public-category.service'
import type { Category } from '@prisma/client'

jest.mock('@/lib/services/public-category.service')
jest.mock('@/components/public/common/CategoryList', () => ({
  default: ({ categories }: { categories: Category[] }) => (
    <div data-testid="category-list">
      {categories.map(cat => (
        <div key={cat.id} data-testid={`category-${cat.slug}`}>
          {cat.name} ({cat._count?.posts || 0})
        </div>
      ))}
    </div>
  )
}))

const mockCategories: (Category & { _count?: { posts: number } })[] = [
  {
    id: 'cat-1',
    name: 'Tech',
    slug: 'tech',
    description: 'Tech articles',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { posts: 5 }
  },
  {
    id: 'cat-2',
    name: 'Life',
    slug: 'life',
    description: 'Life articles',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { posts: 3 }
  }
]

describe('分類列表頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('載入分類列表', () => {
    it('應該顯示所有分類及其文章數量', async () => {
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue(mockCategories)

      const jsx = await CategoriesPage()
      render(jsx)

      expect(screen.getByTestId('category-list')).toBeInTheDocument()
      expect(screen.getByTestId('category-tech')).toBeInTheDocument()
      expect(screen.getByTestId('category-life')).toBeInTheDocument()
      expect(screen.getByText(/Tech \(5\)/)).toBeInTheDocument()
      expect(screen.getByText(/Life \(3\)/)).toBeInTheDocument()
    })
  })

  describe('無分類', () => {
    it('應該顯示「目前沒有分類」的提示訊息', async () => {
      jest.mocked(publicCategoryService.getPublicCategories).mockResolvedValue([])

      const jsx = await CategoriesPage()
      render(jsx)

      expect(screen.getByText(/目前沒有分類/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成分類列表頁 metadata', async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toContain('分類')
      expect(metadata.description).toBeDefined()
      expect(metadata.openGraph).toBeDefined()
    })
  })
})
