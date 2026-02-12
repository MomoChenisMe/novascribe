import { render, screen } from '@testing-library/react'
import HeroSection from '../HeroSection'

describe('HeroSection', () => {
  it('應該渲染主標題', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('應該渲染副標題', () => {
    render(<HeroSection />)
    expect(screen.getByText(/發現更多精彩內容/i)).toBeInTheDocument()
  })

  it('應該渲染 CTA 按鈕', () => {
    render(<HeroSection />)
    const ctaButton = screen.getByRole('link', { name: /開始閱讀/i })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/posts')
  })

  it('應該使用自訂標題', () => {
    const customTitle = '歡迎來到我的部落格'
    render(<HeroSection title={customTitle} />)
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('應該使用自訂副標題', () => {
    const customSubtitle = '分享技術與生活點滴'
    render(<HeroSection subtitle={customSubtitle} />)
    expect(screen.getByText(customSubtitle)).toBeInTheDocument()
  })

  it('應該使用自訂 CTA 文字與連結', () => {
    const customCtaText = '立即探索'
    const customCtaLink = '/explore'
    render(<HeroSection ctaText={customCtaText} ctaLink={customCtaLink} />)
    
    const ctaButton = screen.getByRole('link', { name: customCtaText })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', customCtaLink)
  })

  it('應該有正確的響應式 CSS classes', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('標題應該包含漸層效果', () => {
    const { container } = render(<HeroSection />)
    const heading = container.querySelector('h1')
    expect(heading?.className).toMatch(/gradient|bg-gradient/)
  })
})
