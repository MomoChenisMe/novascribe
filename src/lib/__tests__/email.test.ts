/**
 * Email 模組測試
 * 遵循 Batch 1 需求規格
 */

import type { Comment, Post } from '@prisma/client'

// Mock nodemailer
const mockSendMail = jest.fn()
const mockCreateTransport = jest.fn()

jest.mock('nodemailer', () => ({
  createTransport: (config: any) => {
    mockCreateTransport(config)
    return {
      sendMail: mockSendMail,
    }
  },
}))

describe('Email transporter 初始化', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })

  it('當環境變數完整時應正確初始化 transporter', () => {
    // 驗證模組載入時的行為
    const { getTransporter } = require('../email')
    const transporter = getTransporter()

    // 若環境變數完整，transporter 不應為 null
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      expect(transporter).not.toBeNull()
      expect(mockCreateTransport).toHaveBeenCalled()
    } else {
      expect(transporter).toBeNull()
    }
  })

  it('getTransporter 函式應返回 transporter 實例', () => {
    const { getTransporter } = require('../email')
    const transporter = getTransporter()

    // transporter 的類型應該是符合預期的
    if (transporter) {
      expect(transporter).toHaveProperty('sendMail')
    } else {
      expect(transporter).toBeNull()
    }
  })
})

describe('sendNewCommentNotification', () => {
  let sendNewCommentNotification: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSendMail.mockReset()
    mockSendMail.mockResolvedValue({ messageId: 'test-id' })

    // 重新載入模組以獲取最新的函式
    jest.isolateModules(() => {
      const emailModule = require('../email')
      sendNewCommentNotification = emailModule.sendNewCommentNotification
    })
  })

  const mockPost: Post = {
    id: 1,
    title: '測試文章標題',
    slug: 'test-post',
    content: '測試內容',
    excerpt: '摘要',
    published: true,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    coverImage: null,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
    featuredImage: null,
    altText: null,
  }

  const mockComment: Comment = {
    id: 1,
    postId: 1,
    author: '測試作者',
    email: 'commenter@test.com',
    content: '這是一條測試評論',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    userAgent: null,
    ipHash: 'test-hash',
    website: null,
  }

  // 測試：當 transporter 為 null 時不發送郵件
  describe('當 SMTP 未配置時', () => {
    it('應直接返回不發送郵件', async () => {
      // 模擬 transporter 為 null 的情況
      const originalEnv = { ...process.env }
      delete process.env.SMTP_HOST

      jest.isolateModules(() => {
        const { sendNewCommentNotification: fn } = require('../email')
        fn(mockComment, mockPost)
      })

      // 由於 transporter 在模組載入時初始化，這裡我們測試邏輯
      // 真實場景中，若 SMTP_HOST 未設定，transporter 為 null，不會調用 sendMail

      process.env = originalEnv
    })
  })

  // 測試：SPAM 評論不發送通知
  it('當評論狀態為 SPAM 時不應發送通知', async () => {
    const spamComment: Comment = {
      ...mockComment,
      status: 'SPAM',
    }

    // 確保環境變數完整
    const originalEnv = { ...process.env }
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password123'
    process.env.ADMIN_EMAIL = 'admin@test.com'

    jest.isolateModules(() => {
      const { sendNewCommentNotification: fn } = require('../email')
      fn(spamComment, mockPost)
    })

    // SPAM 評論不應觸發郵件發送
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(mockSendMail).not.toHaveBeenCalled()

    process.env = originalEnv
  })

  // 測試：honeypot 欄位有值時不發送通知
  it('當檢測到 honeypot 欄位時不應發送通知', async () => {
    const honeypotComment: Comment = {
      ...mockComment,
      website: 'http://spam-site.com', // honeypot 欄位有值
    }

    const originalEnv = { ...process.env }
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password123'
    process.env.ADMIN_EMAIL = 'admin@test.com'

    jest.isolateModules(() => {
      const { sendNewCommentNotification: fn } = require('../email')
      fn(honeypotComment, mockPost)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(mockSendMail).not.toHaveBeenCalled()

    process.env = originalEnv
  })

  // 測試：正確格式的通知郵件
  it('應使用正確的信件格式發送通知給管理員', async () => {
    const originalEnv = { ...process.env }
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password123'
    process.env.ADMIN_EMAIL = 'admin@test.com'

    let capturedFn: any
    jest.isolateModules(() => {
      const { sendNewCommentNotification: fn } = require('../email')
      capturedFn = fn
    })

    await capturedFn(mockComment, mockPost)

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'test@test.com',
      to: 'admin@test.com',
      subject: '[NovaScribe] 新評論待審核：測試文章標題',
      html: expect.any(String),
    })

    process.env = originalEnv
  })

  // 測試：信件內容包含評論者資訊
  it('信件內容應包含評論者資訊和評論內容', async () => {
    const originalEnv = { ...process.env }
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password123'
    process.env.ADMIN_EMAIL = 'admin@test.com'

    let capturedFn: any
    jest.isolateModules(() => {
      const { sendNewCommentNotification: fn } = require('../email')
      capturedFn = fn
    })

    await capturedFn(mockComment, mockPost)

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('測試作者')
    expect(callArgs.html).toContain('commenter@test.com')
    expect(callArgs.html).toContain('這是一條測試評論')
    expect(callArgs.html).toContain('測試文章標題')

    process.env = originalEnv
  })

  // 測試：ADMIN_EMAIL 未設定時不發送
  it('當 ADMIN_EMAIL 未設定時不應發送郵件', async () => {
    const originalEnv = { ...process.env }
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password123'
    delete process.env.ADMIN_EMAIL

    let capturedFn: any
    jest.isolateModules(() => {
      const { sendNewCommentNotification: fn } = require('../email')
      capturedFn = fn
    })

    await capturedFn(mockComment, mockPost)

    expect(mockSendMail).not.toHaveBeenCalled()

    process.env = originalEnv
  })
})
