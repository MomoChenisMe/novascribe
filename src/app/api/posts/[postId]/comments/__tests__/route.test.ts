/**
 * 公開評論 API 測試
 * POST /api/posts/[postId]/comments - 提交評論
 * GET /api/posts/[postId]/comments - 查詢已核准評論
 */

// Mock Next.js modules first
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

// Mock dependencies before imports
jest.mock('@/lib/services/comment.service');
jest.mock('@/lib/anti-spam');
jest.mock('@/lib/email');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    post: {
      findUnique: jest.fn(),
    },
  },
}));

import { createComment, getApprovedComments } from '@/lib/services/comment.service';
import { checkAntiSpam } from '@/lib/anti-spam';
import { sendNewCommentNotification } from '@/lib/email';
import prisma from '@/lib/prisma';

// Type assertions for mocked functions
const mockCreateComment = createComment as jest.MockedFunction<typeof createComment>;
const mockCheckAntiSpam = checkAntiSpam as jest.MockedFunction<typeof checkAntiSpam>;
const mockSendNewCommentNotification = sendNewCommentNotification as jest.MockedFunction<typeof sendNewCommentNotification>;
const mockGetApprovedComments = getApprovedComments as jest.MockedFunction<typeof getApprovedComments>;
const mockPrismaPostFindUnique = prisma.post.findUnique as jest.MockedFunction<typeof prisma.post.findUnique>;

// Import route handlers after mocks
import { POST, GET } from '../route';

/**
 * Helper: 建立 mock NextRequest
 */
function createMockRequest(url: string, options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}) {
  const headers = new Map(Object.entries(options.headers || {}));
  
  return {
    url,
    method: options.method || 'GET',
    headers: {
      get: (key: string) => headers.get(key.toLowerCase()) || null,
    },
    json: async () => options.body,
  } as any;
}

describe('POST /api/posts/[postId]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 測試 6.1.1：成功提交評論
   */
  it('should create comment successfully', async () => {
    const mockComment = {
      id: 'comment-1',
      postId: 'post-1',
      parentId: null,
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      content: 'This is a test comment',
      status: 'PENDING',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPost = {
      id: 'post-1',
      title: 'Test Post',
      status: 'PUBLISHED',
    };

    mockCheckAntiSpam.mockReturnValue({ pass: true });
    mockCreateComment.mockResolvedValue(mockComment);
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any);
    mockSendNewCommentNotification.mockResolvedValue();

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Mozilla/5.0',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        content: 'This is a test comment',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('comment-1');
    expect(data.authorName).toBe('Test User');
    expect(data.content).toBe('This is a test comment');

    // 驗證 anti-spam 被呼叫
    expect(mockCheckAntiSpam).toHaveBeenCalledWith({
      content: 'This is a test comment',
      honeypot: undefined,
      ipAddress: '127.0.0.1',
    });

    // 驗證 createComment 被呼叫
    expect(mockCreateComment).toHaveBeenCalledWith({
      postId: 'post-1',
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      content: 'This is a test comment',
      parentId: null,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    // 驗證通知被呼叫（非同步）
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockSendNewCommentNotification).toHaveBeenCalled();
  });

  /**
   * 測試 6.1.2：Anti-spam honeypot 攔截
   */
  it('should reject comment with honeypot filled', async () => {
    mockCheckAntiSpam.mockReturnValue({ pass: false, reason: 'honeypot' });

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Bot',
        authorEmail: 'bot@example.com',
        content: 'Spam content',
        honeypot: 'filled-by-bot',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  /**
   * 測試 6.1.3：Anti-spam rate limit 攔截（429）
   */
  it('should return 429 when rate limited', async () => {
    mockCheckAntiSpam.mockReturnValue({ pass: false, reason: 'rate_limit' });

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        content: 'Test comment',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBeDefined();
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  /**
   * 測試 6.1.4：內容過濾攔截（forbidden word）
   */
  it('should reject comment with forbidden words', async () => {
    mockCheckAntiSpam.mockReturnValue({ pass: false, reason: 'forbidden_word' });

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        content: 'Buy viagra now!',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });

    expect(response.status).toBe(400);
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  /**
   * 測試 6.1.5：欄位驗證（缺少必填欄位）
   */
  it('should return 400 when required fields are missing', async () => {
    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Test User',
        // 缺少 authorEmail 和 content
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(mockCheckAntiSpam).not.toHaveBeenCalled();
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  /**
   * 測試 6.1.6：Email 格式驗證
   */
  it('should return 400 when email format is invalid', async () => {
    mockCheckAntiSpam.mockReturnValue({ pass: true });
    mockCreateComment.mockRejectedValue(new Error('Email 格式不正確'));

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'invalid-email',
        content: 'Test comment',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Email');
  });

  /**
   * 測試 6.1.7：非 PUBLISHED 文章（404）
   */
  it('should return 404 when post is not published', async () => {
    mockCheckAntiSpam.mockReturnValue({ pass: true });
    mockCreateComment.mockRejectedValue(new Error('無法在未發布的文章上留言'));

    const request = createMockRequest('http://localhost/api/posts/draft-post/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        content: 'Test comment',
      },
    });

    const response = await POST(request, { params: { postId: 'draft-post' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  /**
   * 測試 6.1.8：帶 parentId 的回覆
   */
  it('should create reply with parentId', async () => {
    const mockReply = {
      id: 'reply-1',
      postId: 'post-1',
      parentId: 'comment-1',
      authorName: 'Replier',
      authorEmail: 'reply@example.com',
      content: 'This is a reply',
      status: 'PENDING',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPost = {
      id: 'post-1',
      title: 'Test Post',
      status: 'PUBLISHED',
    };

    mockCheckAntiSpam.mockReturnValue({ pass: true });
    mockCreateComment.mockResolvedValue(mockReply);
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any);
    mockSendNewCommentNotification.mockResolvedValue();

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        authorName: 'Replier',
        authorEmail: 'reply@example.com',
        content: 'This is a reply',
        parentId: 'comment-1',
      },
    });

    const response = await POST(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.parentId).toBe('comment-1');

    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: 'comment-1',
      })
    );
  });

  /**
   * 測試 6.1.9：從 x-real-ip 取得 IP
   */
  it('should extract IP from x-real-ip header', async () => {
    const mockPost = {
      id: 'post-1',
      title: 'Test Post',
      status: 'PUBLISHED',
    };

    mockCheckAntiSpam.mockReturnValue({ pass: true });
    mockCreateComment.mockResolvedValue({
      id: 'comment-1',
      postId: 'post-1',
      parentId: null,
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      content: 'Test',
      status: 'PENDING',
      ipAddress: '192.168.1.1',
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-real-ip': '192.168.1.1',
      },
      body: {
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        content: 'Test',
      },
    });

    await POST(request, { params: { postId: 'post-1' } });

    expect(mockCheckAntiSpam).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: '192.168.1.1',
      })
    );
  });
});

describe('GET /api/posts/[postId]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 測試 6.3.1：取得已核准評論（巢狀結構）
   */
  it('should return approved comments with nested structure', async () => {
    const mockResult = {
      comments: [
        {
          id: 'comment-1',
          postId: 'post-1',
          parentId: null,
          authorName: 'User 1',
          authorEmail: 'user1@example.com',
          content: 'Top level comment',
          status: 'APPROVED',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          replies: [
            {
              id: 'reply-1',
              postId: 'post-1',
              parentId: 'comment-1',
              authorName: 'User 2',
              authorEmail: 'user2@example.com',
              content: 'Reply to comment 1',
              status: 'APPROVED',
              createdAt: new Date('2025-01-02'),
              updatedAt: new Date('2025-01-02'),
            },
          ],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockGetApprovedComments.mockResolvedValue(mockResult);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments');

    const response = await GET(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].id).toBe('comment-1');
    expect(data.comments[0].replies).toHaveLength(1);
    expect(data.comments[0].replies[0].id).toBe('reply-1');
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);

    expect(mockGetApprovedComments).toHaveBeenCalledWith('post-1', {
      page: 1,
      limit: 10,
    });
  });

  /**
   * 測試 6.3.2：分頁參數
   */
  it('should handle pagination parameters', async () => {
    const mockResult = {
      comments: [],
      total: 25,
      page: 2,
      limit: 5,
      totalPages: 5,
    };

    mockGetApprovedComments.mockResolvedValue(mockResult);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments?page=2&limit=5');

    const response = await GET(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.limit).toBe(5);
    expect(data.totalPages).toBe(5);

    expect(mockGetApprovedComments).toHaveBeenCalledWith('post-1', {
      page: 2,
      limit: 5,
    });
  });

  /**
   * 測試 6.3.3：空結果
   */
  it('should return empty array when no comments', async () => {
    const mockResult = {
      comments: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    mockGetApprovedComments.mockResolvedValue(mockResult);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments');

    const response = await GET(request, { params: { postId: 'post-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toEqual([]);
    expect(data.total).toBe(0);
  });

  /**
   * 測試 6.3.4：預設分頁參數
   */
  it('should use default pagination when not provided', async () => {
    const mockResult = {
      comments: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    mockGetApprovedComments.mockResolvedValue(mockResult);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments');

    await GET(request, { params: { postId: 'post-1' } });

    expect(mockGetApprovedComments).toHaveBeenCalledWith('post-1', {
      page: 1,
      limit: 10,
    });
  });

  /**
   * 測試 6.3.5：無效的分頁參數（負數）
   */
  it('should handle invalid pagination parameters gracefully', async () => {
    const mockResult = {
      comments: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    mockGetApprovedComments.mockResolvedValue(mockResult);

    const request = createMockRequest('http://localhost/api/posts/post-1/comments?page=-1&limit=0');

    await GET(request, { params: { postId: 'post-1' } });

    // 應該使用預設值或修正後的值
    expect(mockGetApprovedComments).toHaveBeenCalledWith('post-1', {
      page: 1,
      limit: 10,
    });
  });
});
