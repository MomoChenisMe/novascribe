import { render, screen } from '@testing-library/react'
import AboutPage, { generateMetadata } from '../page'

describe('關於頁', () => {
  describe('載入關於頁面', () => {
    it('應該顯示部落格介紹和作者資訊', async () => {
      const jsx = await AboutPage()
      render(jsx)

      expect(screen.getByText(/關於 NovaScribe/)).toBeInTheDocument()
      expect(screen.getByText(/NovaScribe 是一個專注於技術分享/)).toBeInTheDocument()
    })

    it('應該顯示技術棧資訊', async () => {
      const jsx = await AboutPage()
      render(jsx)

      expect(screen.getByText(/技術棧/)).toBeInTheDocument()
      expect(screen.getByText(/Next\.js/)).toBeInTheDocument()
      expect(screen.getByText(/TypeScript/)).toBeInTheDocument()
      expect(screen.getByText(/Tailwind CSS/)).toBeInTheDocument()
      expect(screen.getByText(/Prisma/)).toBeInTheDocument()
    })

    it('應該顯示聯絡資訊', async () => {
      const jsx = await AboutPage()
      render(jsx)

      expect(screen.getByText(/聯絡方式/)).toBeInTheDocument()
    })
  })

  describe('generateMetadata', () => {
    it('應該生成關於頁 metadata', async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toContain('關於')
      expect(metadata.description).toBeDefined()
      expect(metadata.openGraph).toBeDefined()
    })
  })
})
