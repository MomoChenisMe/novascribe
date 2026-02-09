/**
 * @file 文章 API Route Handler 測試
 * @description 測試所有文章相關 API 端點的請求處理、認證、參數驗證、錯誤回應
 *   - GET /api/admin/posts：取得文章列表
 *   - POST /api/admin/posts：建立文章
 *   - GET /api/admin/posts/[id]：取得單篇文章
 *   - PUT /api/admin/posts/[id]：更新文章
 *   - DELETE /api/admin/posts/[id]：刪除文章
 *   - PATCH /api/admin/posts/[id]/status：切換文章狀態
 *   - POST /api/admin/posts/batch：批次操作
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/admin/posts/route';
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from '@/app/api/admin/posts/[id]/route';
import { PATCH } from '@/app/api/admin/posts/[id]/status/route';
import { POST as BATCH } from '@/app/api/admin/posts/batch/route';
import * as postService from '@/services/post.service';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock post service
jest.mock('@/services/post.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockPostService = postService as jest.Mocked<typeof postService>;

/** 建立 mock Request */
function createRequest(
  method: string,
  options: {
    body?: Record<string, unknown>;
    searchParams?: Record<string, string>;
    url?: string;
  } = {}
): Request {
  const baseUrl = options.url ?? 'http://localhost:3000/api/admin/posts';
  const url = new URL(baseUrl);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const init: RequestInit = { method };
  if (options.body) {
    init.body = JSON.stringify(options.body);
    init.headers = { 'Content-Type': 'application/json' };
  }

  return new Request(url.toString(), init);
}

/** Mock 文章資料 */
function mockPost(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    content: string;
    status: string;
  }> = {}
) {
  return {
    id: 'post-1',
    title: '測試文章',
    slug: 'test-post',
    content: '# 測試內容',
    excerpt: null,
    coverImage: null,
    status: 'DRAFT',
    publishedAt: null,
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/** Mock session */
function mockSession() {
  return {
    user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== 認證檢查 =====
describe('認證檢查', () => {
  it('GET /api/admin/posts 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('POST /api/admin/posts 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('POST', {
      body: { title: 'Test', slug: 'test', content: 'Content' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('GET /api/admin/posts/[id] 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(401);
  });

  it('PUT /api/admin/posts/[id] 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('PUT', { body: { title: 'Updated' } });
    const res = await PUT(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(401);
  });

  it('DELETE /api/admin/posts/[id] 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(401);
  });

  it('PATCH /api/admin/posts/[id]/status 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('PATCH', {
      body: { status: 'PUBLISHED' },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(401);
  });

  it('POST /api/admin/posts/batch 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('POST', {
      body: { action: 'delete', ids: ['post-1'] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(401);
  });
});

// ===== GET /api/admin/posts =====
describe('GET /api/admin/posts', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應回傳文章列表', async () => {
    const posts = [mockPost()];
    mockPostService.getPosts.mockResolvedValue({ data: posts, total: 1 });

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.meta).toBeDefined();
  });

  it('應傳遞查詢參數', async () => {
    mockPostService.getPosts.mockResolvedValue({ data: [], total: 0 });

    const req = createRequest('GET', {
      searchParams: {
        page: '2',
        limit: '5',
        status: 'PUBLISHED',
        categoryId: 'cat-1',
        tagId: 'tag-1',
        search: 'test',
        sortBy: 'publishedAt',
        sortOrder: 'asc',
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockPostService.getPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 5,
        status: 'PUBLISHED',
        categoryId: 'cat-1',
        tagId: 'tag-1',
        search: 'test',
        sortBy: 'publishedAt',
        sortOrder: 'asc',
      })
    );
  });

  it('應處理 service 錯誤', async () => {
    mockPostService.getPosts.mockRejectedValue(new Error('Database error'));

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Internal server error' });
  });
});

// ===== POST /api/admin/posts =====
describe('POST /api/admin/posts', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應成功建立文章', async () => {
    const post = mockPost();
    mockPostService.createPost.mockResolvedValue(post as any);

    const req = createRequest('POST', {
      body: {
        title: '測試文章',
        slug: 'test-post',
        content: '# 測試內容',
      },
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('應回傳驗證錯誤（缺少必填欄位）', async () => {
    const req = createRequest('POST', {
      body: { title: '' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
  });

  it('slug 已存在應回傳 409', async () => {
    mockPostService.createPost.mockRejectedValue(
      new Error('Slug "test-post" already exists')
    );

    const req = createRequest('POST', {
      body: {
        title: '測試文章',
        slug: 'test-post',
        content: '# 測試內容',
      },
    });
    const res = await POST(req);

    expect(res.status).toBe(409);
  });
});

// ===== GET /api/admin/posts/[id] =====
describe('GET /api/admin/posts/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應回傳文章含關聯', async () => {
    const post = {
      ...mockPost(),
      category: { id: 'cat-1', name: '技術' },
      tags: [{ tag: { id: 'tag-1', name: 'JS' } }],
      author: { id: 'user-1', name: 'Admin' },
    };
    mockPostService.getPostById.mockResolvedValue(post as any);

    const req = createRequest('GET');
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('文章不存在應回傳 404', async () => {
    mockPostService.getPostById.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Post not found');
  });
});

// ===== PUT /api/admin/posts/[id] =====
describe('PUT /api/admin/posts/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應成功更新文章', async () => {
    const updated = mockPost({ title: '更新後' });
    mockPostService.updatePost.mockResolvedValue(updated as any);

    const req = createRequest('PUT', {
      body: { title: '更新後' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('文章不存在應回傳 404', async () => {
    mockPostService.updatePost.mockRejectedValue(
      new Error('Post "nonexistent" not found')
    );

    const req = createRequest('PUT', {
      body: { title: '更新' },
    });
    const res = await PUT(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
  });

  it('slug 重複應回傳 409', async () => {
    mockPostService.updatePost.mockRejectedValue(
      new Error('Slug "duplicate" already exists')
    );

    const req = createRequest('PUT', {
      body: { slug: 'duplicate' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(409);
  });
});

// ===== DELETE /api/admin/posts/[id] =====
describe('DELETE /api/admin/posts/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應成功刪除文章', async () => {
    mockPostService.deletePost.mockResolvedValue(undefined);

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('文章不存在應回傳 404', async () => {
    mockPostService.deletePost.mockRejectedValue(
      new Error('Post "nonexistent" not found')
    );

    const req = createRequest('DELETE');
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
  });
});

// ===== PATCH /api/admin/posts/[id]/status =====
describe('PATCH /api/admin/posts/[id]/status', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應成功切換狀態', async () => {
    const updated = mockPost({ status: 'PUBLISHED' });
    mockPostService.updatePostStatus.mockResolvedValue(updated as any);

    const req = createRequest('PATCH', {
      body: { status: 'PUBLISHED' },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('PUBLISHED');
  });

  it('應支援 scheduledAt', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const updated = mockPost({ status: 'SCHEDULED' });
    mockPostService.updatePostStatus.mockResolvedValue(updated as any);

    const req = createRequest('PATCH', {
      body: { status: 'SCHEDULED', scheduledAt: futureDate },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(200);
    expect(mockPostService.updatePostStatus).toHaveBeenCalledWith(
      'post-1',
      'SCHEDULED',
      expect.any(Date)
    );
  });

  it('無效狀態值應回傳 400', async () => {
    const req = createRequest('PATCH', {
      body: { status: 'INVALID' },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(400);
  });

  it('無效轉換應回傳 400', async () => {
    mockPostService.updatePostStatus.mockRejectedValue(
      new Error('Invalid status transition: ARCHIVED → PUBLISHED')
    );

    const req = createRequest('PATCH', {
      body: { status: 'PUBLISHED' },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'post-1' }) });

    expect(res.status).toBe(400);
  });

  it('文章不存在應回傳 404', async () => {
    mockPostService.updatePostStatus.mockRejectedValue(
      new Error('Post "nonexistent" not found')
    );

    const req = createRequest('PATCH', {
      body: { status: 'PUBLISHED' },
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
  });
});

// ===== POST /api/admin/posts/batch =====
describe('POST /api/admin/posts/batch', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession());
  });

  it('應成功批次刪除', async () => {
    mockPostService.batchDeletePosts.mockResolvedValue(3);

    const req = createRequest('POST', {
      body: { action: 'delete', ids: ['post-1', 'post-2', 'post-3'] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, count: 3 });
  });

  it('應成功批次發佈', async () => {
    mockPostService.batchPublishPosts.mockResolvedValue(2);

    const req = createRequest('POST', {
      body: { action: 'publish', ids: ['post-1', 'post-2'] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, count: 2 });
  });

  it('應成功批次下架', async () => {
    mockPostService.batchArchivePosts.mockResolvedValue(2);

    const req = createRequest('POST', {
      body: { action: 'archive', ids: ['post-1', 'post-2'] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, count: 2 });
  });

  it('無效 action 應回傳 400', async () => {
    const req = createRequest('POST', {
      body: { action: 'invalid', ids: ['post-1'] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });

  it('缺少 ids 應回傳 400', async () => {
    const req = createRequest('POST', {
      body: { action: 'delete' },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(400);
  });

  it('空 ids 陣列應回傳 400', async () => {
    const req = createRequest('POST', {
      body: { action: 'delete', ids: [] },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(400);
  });

  it('超過 100 筆應回傳 400', async () => {
    mockPostService.batchDeletePosts.mockRejectedValue(
      new Error('Batch operation limited to 100 items')
    );

    const ids = Array.from({ length: 101 }, (_, i) => `post-${i}`);
    const req = createRequest('POST', {
      body: { action: 'delete', ids },
    });
    const res = await BATCH(req);

    expect(res.status).toBe(400);
  });
});
