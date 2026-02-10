import { render, screen, fireEvent } from '@testing-library/react'
import ShareButtons from '../ShareButtons'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
}

Object.assign(navigator, {
  clipboard: mockClipboard,
})

// Mock window.open
global.open = jest.fn()

describe('ShareButtons', () => {
  const mockProps = {
    title: '測試文章標題',
    url: 'https://example.com/posts/test-article',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('應該渲染所有分享按鈕', () => {
    render(<ShareButtons {...mockProps} />)

    expect(screen.getByLabelText(/分享到 Twitter/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/分享到 Facebook/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/分享到 LINE/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/複製連結/i)).toBeInTheDocument()
  })

  it('點擊 Twitter 按鈕應該開啟正確的分享 URL', () => {
    render(<ShareButtons {...mockProps} />)

    const twitterButton = screen.getByLabelText(/分享到 Twitter/i)
    fireEvent.click(twitterButton)

    const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(mockProps.title)}&url=${encodeURIComponent(mockProps.url)}`
    expect(global.open).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer')
  })

  it('點擊 Facebook 按鈕應該開啟正確的分享 URL', () => {
    render(<ShareButtons {...mockProps} />)

    const facebookButton = screen.getByLabelText(/分享到 Facebook/i)
    fireEvent.click(facebookButton)

    const expectedUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mockProps.url)}`
    expect(global.open).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer')
  })

  it('點擊 LINE 按鈕應該開啟正確的分享 URL', () => {
    render(<ShareButtons {...mockProps} />)

    const lineButton = screen.getByLabelText(/分享到 LINE/i)
    fireEvent.click(lineButton)

    const expectedUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(mockProps.url)}`
    expect(global.open).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer')
  })

  it('點擊複製連結按鈕應該複製 URL 到剪貼簿', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    render(<ShareButtons {...mockProps} />)

    const copyButton = screen.getByLabelText(/複製連結/i)
    fireEvent.click(copyButton)

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockProps.url)
  })

  it('複製成功後應該顯示已複製提示', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    render(<ShareButtons {...mockProps} />)

    const copyButton = screen.getByLabelText(/複製連結/i)
    fireEvent.click(copyButton)

    // Wait for the state update
    await screen.findByText(/已複製/i)
  })

  it('複製失敗時應該處理錯誤', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'))
    render(<ShareButtons {...mockProps} />)

    const copyButton = screen.getByLabelText(/複製連結/i)
    fireEvent.click(copyButton)

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('應該使用正確的 CSS classes 進行樣式設定', () => {
    const { container } = render(<ShareButtons {...mockProps} />)

    const buttonsContainer = container.querySelector('[class*="flex"]')
    expect(buttonsContainer).toBeInTheDocument()
  })

  it('沒有提供 title 時應該使用空字串', () => {
    render(<ShareButtons url={mockProps.url} />)

    const twitterButton = screen.getByLabelText(/分享到 Twitter/i)
    fireEvent.click(twitterButton)

    const expectedUrl = `https://twitter.com/intent/tweet?text=&url=${encodeURIComponent(mockProps.url)}`
    expect(global.open).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer')
  })
})
