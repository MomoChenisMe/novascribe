/**
 * @file 標籤 API Route Handler 測試
 * @description 測試 /api/admin/tags、/api/admin/tags/[id]、/api/admin/tags/unused 的 API 處理
 *   - GET：取得標籤列表（搜尋、排序、分頁）
 *   - POST：建立標籤
 *   - PUT：更新標籤
 *   - DELETE /api/admin/tags/[id]：刪除標籤
 *   - DELETE /api/admin/tags/unused：清理未使用標籤
 *   - 認證檢查：未登入應回傳 401
 *   - 錯誤處理：驗證失敗、標籤不存在
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/admin/tags/route';
import { PUT, DELETE } from '@/app/api/admin/tags/[id]/route';
import { DELETE as DELETE_UNUSED } from '@/app/api/admin/tags/unused/route';
import * as tagService from '@/services/tag.service';

// Mock Prisma（需在 service 被載入前 mock）
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

// Mock tag service
jest.mock('@/services/tag.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockTagService = tagService as jest.Mocked<typeof tagService>;

/** 建立 mock Request */
function createRequest(
  method: string,
  options: {
    body?: Record<string, unknown>;
    searchParams?: Record<string, string>;
    url?: string;
  } = {}
): Request {
  const baseUrl = options.url ?? 'http://localhost:3000/api/admin/tags';
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

/** Mock 標籤資料 */
function mockTag(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/** Mock 標籤含使用次數 */
function mockTagWithCount(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    postCount: number;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    postCount: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== 認證檢查 =====
describe('認證檢查', () => {
  it('GET 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('POST 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('POST', {
      body: { name: 'JavaScript', slug: 'javascript' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('PUT 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('PUT', {
      body: { name: 'JS' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(401);
  });

  it('DELETE 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(401);
  });

  it('DELETE /unused 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('DELETE', {
      url: 'http://localhost:3000/api/admin/tags/unused',
    });
    const res = await DELETE_UNUSED(req);

    expect(res.status).toBe(401);
  });
});

// ===== GET /api/admin/tags =====
describe('GET /api/admin/tags', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應回傳標籤列表含使用次數和分頁', async () => {
    const tags = [
      mockTagWithCount(),
      mockTagWithCount({ id: 'tag-2', name: 'TypeScript', slug: 'typescript', postCount: 5 }),
    ];
    mockTagService.getTags.mockResolvedValue({ data: tags, total: 2 });

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBe(2);
  });

  it('應傳遞搜尋參數給 service', async () => {
    mockTagService.getTags.mockResolvedValue({ data: [], total: 0 });

    const req = createRequest('GET', {
      searchParams: { search: 'java' },
    });
    await GET(req);

    expect(mockTagService.getTags).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'java' })
    );
  });

  it('應傳遞排序參數給 service', async () => {
    mockTagService.getTags.mockResolvedValue({ data: [], total: 0 });

    const req = createRequest('GET', {
      searchParams: { sortBy: 'postCount', sortOrder: 'desc' },
    });
    await GET(req);

    expect(mockTagService.getTags).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'postCount', sortOrder: 'desc' })
    );
  });

  it('應傳遞分頁參數給 service', async () => {
    mockTagService.getTags.mockResolvedValue({ data: [], total: 0 });

    const req = createRequest('GET', {
      searchParams: { page: '2', limit: '5' },
    });
    await GET(req);

    expect(mockTagService.getTags).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5 })
    );
  });

  it('應使用預設分頁參數', async () => {
    mockTagService.getTags.mockResolvedValue({ data: [], total: 0 });

    const req = createRequest('GET');
    await GET(req);

    expect(mockTagService.getTags).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 })
    );
  });
});

// ===== POST /api/admin/tags =====
describe('POST /api/admin/tags', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功建立標籤', async () => {
    const newTag = mockTag();
    mockTagService.createTag.mockResolvedValue(newTag as any);

    const req = createRequest('POST', {
      body: { name: 'JavaScript', slug: 'javascript' },
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('JavaScript');
  });

  it('缺少必填欄位應回傳 400', async () => {
    const req = createRequest('POST', {
      body: { name: '' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('slug 格式不符應回傳 400', async () => {
    const req = createRequest('POST', {
      body: { name: 'JavaScript', slug: 'Hello World!' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('slug 重複應回傳 409', async () => {
    mockTagService.createTag.mockRejectedValue(
      new Error('Slug "javascript" already exists')
    );

    const req = createRequest('POST', {
      body: { name: 'JavaScript', slug: 'javascript' },
    });
    const res = await POST(req);

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ===== PUT /api/admin/tags/[id] =====
describe('PUT /api/admin/tags/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功更新標籤', async () => {
    const updated = mockTag({ name: 'JS' });
    mockTagService.updateTag.mockResolvedValue(updated as any);

    const req = createRequest('PUT', {
      body: { name: 'JS' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('JS');
  });

  it('標籤不存在應回傳 404', async () => {
    mockTagService.updateTag.mockRejectedValue(
      new Error('Tag "nonexistent" not found')
    );

    const req = createRequest('PUT', {
      body: { name: 'JS' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(res.status).toBe(404);
  });

  it('slug 重複應回傳 409', async () => {
    mockTagService.updateTag.mockRejectedValue(
      new Error('Slug "typescript" already exists')
    );

    const req = createRequest('PUT', {
      body: { slug: 'typescript' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(409);
  });

  it('驗證失敗應回傳 400', async () => {
    const req = createRequest('PUT', {
      body: { slug: 'INVALID SLUG!!' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(400);
  });
});

// ===== DELETE /api/admin/tags/[id] =====
describe('DELETE /api/admin/tags/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功刪除標籤', async () => {
    mockTagService.deleteTag.mockResolvedValue();

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'tag-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('標籤不存在應回傳 404', async () => {
    mockTagService.deleteTag.mockRejectedValue(
      new Error('Tag "nonexistent" not found')
    );

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(res.status).toBe(404);
  });
});

// ===== DELETE /api/admin/tags/unused =====
describe('DELETE /api/admin/tags/unused', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功清理未使用標籤', async () => {
    mockTagService.deleteUnusedTags.mockResolvedValue(5);

    const req = createRequest('DELETE', {
      url: 'http://localhost:3000/api/admin/tags/unused',
    });
    const res = await DELETE_UNUSED(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deletedCount).toBe(5);
  });

  it('沒有未使用標籤時應回傳 deletedCount: 0', async () => {
    mockTagService.deleteUnusedTags.mockResolvedValue(0);

    const req = createRequest('DELETE', {
      url: 'http://localhost:3000/api/admin/tags/unused',
    });
    const res = await DELETE_UNUSED(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deletedCount).toBe(0);
  });
});
