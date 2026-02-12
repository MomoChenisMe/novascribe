import { render, screen } from '@testing-library/react'

import TagsPage, { generateMetadata } from '../page'
import * as publicTagService from '@/lib/services/public-tag.service'
import type { Tag } from '@prisma/client'

jest.mock('@/lib/services/public-tag.service')
jest.mock('@/components/public/common/TagCloud', () => ({
  default: ({ tags }: { tags: Tag[] }) => (
    <div data-testid="tag-cloud">
      {tags.map(tag => (
        <div key={tag.id} data-testid={`tag-${tag.slug}`}>
          {tag.name} ({tag._count?.posts || 0})
        </div>
      ))}
    </div>
  )
}))

const mockTags: (Tag & { _count?: { posts: number } })[] = [
  {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { posts: 10 }
  },
  {
    id: 'tag-2',
    name: 'React',
    slug: 'react',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { posts: 7 }
  },
  {
    id: 'tag-3',
    name: 'TypeScript',
    slug: 'typescript',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { posts: 5 }
  }
]

describe('標籤列表頁', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('載入標籤雲', () => {
    it('應該以標籤雲的形式顯示所有標籤', async () => {
      jest.mocked(publicTagService.getPublicTags).mockResolvedValue(mockTags)

      const jsx = await TagsPage()
      render(jsx)

      expect(screen.getByTestId('tag-cloud')).toBeInTheDocument()
      expect(screen.getByTestId('tag-javascript')).toBeInTheDocument()
      expect(screen.getByTestId('tag-react')).toBeInTheDocument()
      expect(screen.getByTestId('tag-typescript')).toBeInTheDocument()
    })

    it('應該顯示標籤文章數量', async () => {
      jest.mocked(publicTagService.getPublicTags).mockResolvedValue(mockTags)

      const jsx = await TagsPage()
      render(jsx)

      expect(screen.getByText(/JavaScript \(10\)/)).toBeInTheDocument()
      expect(screen.getByText(/React \(7\)/)).toBeInTheDocument()
      expect(screen.getByText(/TypeScript \(5\)/)).toBeInTheDocument()
    })
  })

  describe('無標籤', () => {
    it('應該顯示「目前沒有標籤」的提示訊息', async () => {
      jest.mocked(publicTagService.getPublicTags).mockResolvedValue([])

      const jsx = await TagsPage()
      render(jsx)

      expect(screen.getByText(/目前沒有標籤/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成標籤列表頁 metadata', async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toContain('標籤')
      expect(metadata.description).toBeDefined()
      expect(metadata.openGraph).toBeDefined()
    })
  })
})
