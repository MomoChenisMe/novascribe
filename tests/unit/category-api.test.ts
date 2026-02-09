/**
 * @file 分類 API Route Handler 測試
 * @description 測試 /api/admin/categories 與 /api/admin/categories/[id] 的 API 處理
 *   - GET：取得分類列表（扁平/樹狀）
 *   - POST：建立分類
 *   - PUT：更新分類
 *   - DELETE：刪除分類
 *   - 認證檢查：未登入應回傳 401
 *   - 錯誤處理：驗證失敗、分類不存在、循環參照
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/admin/categories/route';
import { PUT, DELETE } from '@/app/api/admin/categories/[id]/route';
import * as categoryService from '@/services/category.service';

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

// Mock category service
jest.mock('@/services/category.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

/** 建立 mock Request */
function createRequest(
  method: string,
  options: {
    body?: Record<string, unknown>;
    searchParams?: Record<string, string>;
  } = {}
): Request {
  const url = new URL('http://localhost:3000/api/admin/categories');
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

/** Mock 分類資料 */
function mockCategory(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: 'cat-1',
    name: '技術',
    slug: 'tech',
    parentId: null,
    sortOrder: 0,
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
      body: { name: '技術', slug: 'tech' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('PUT 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('PUT', {
      body: { name: '科技' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(401);
  });

  it('DELETE 未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(401);
  });
});

// ===== GET /api/admin/categories =====
describe('GET /api/admin/categories', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應回傳扁平分類列表', async () => {
    const categories = [mockCategory(), mockCategory({ id: 'cat-2', name: '生活', slug: 'life' })];
    mockCategoryService.getCategories.mockResolvedValue(categories as any);

    const req = createRequest('GET');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it('tree=true 應回傳樹狀結構', async () => {
    const tree = [
      {
        id: 'cat-1',
        name: '技術',
        slug: 'tech',
        parentId: null,
        sortOrder: 0,
        children: [],
      },
    ];
    mockCategoryService.getCategoryTree.mockResolvedValue(tree);

    const req = createRequest('GET', { searchParams: { tree: 'true' } });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockCategoryService.getCategoryTree).toHaveBeenCalled();
  });
});

// ===== POST /api/admin/categories =====
describe('POST /api/admin/categories', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功建立分類', async () => {
    const newCat = mockCategory();
    mockCategoryService.createCategory.mockResolvedValue(newCat as any);

    const req = createRequest('POST', {
      body: { name: '技術', slug: 'tech' },
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('技術');
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
      body: { name: '技術', slug: 'Hello World!' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('slug 重複應回傳 409', async () => {
    mockCategoryService.createCategory.mockRejectedValue(
      new Error('Slug "tech" already exists')
    );

    const req = createRequest('POST', {
      body: { name: '技術', slug: 'tech' },
    });
    const res = await POST(req);

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ===== PUT /api/admin/categories/[id] =====
describe('PUT /api/admin/categories/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功更新分類', async () => {
    const updated = mockCategory({ name: '科技' });
    mockCategoryService.updateCategory.mockResolvedValue(updated as any);

    const req = createRequest('PUT', {
      body: { name: '科技' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('科技');
  });

  it('分類不存在應回傳 404', async () => {
    mockCategoryService.updateCategory.mockRejectedValue(
      new Error('Category "nonexistent" not found')
    );

    const req = createRequest('PUT', {
      body: { name: '科技' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(res.status).toBe(404);
  });

  it('循環參照應回傳 409', async () => {
    mockCategoryService.updateCategory.mockRejectedValue(
      new Error('Circular reference detected')
    );

    const req = createRequest('PUT', {
      body: { parentId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(409);
  });

  it('驗證失敗應回傳 400', async () => {
    const req = createRequest('PUT', {
      body: { slug: 'INVALID SLUG!!' },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(400);
  });
});

// ===== DELETE /api/admin/categories/[id] =====
describe('DELETE /api/admin/categories/[id]', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('應成功刪除分類', async () => {
    mockCategoryService.deleteCategory.mockResolvedValue();

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'cat-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('分類不存在應回傳 404', async () => {
    mockCategoryService.deleteCategory.mockRejectedValue(
      new Error('Category "nonexistent" not found')
    );

    const req = createRequest('DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(res.status).toBe(404);
  });
});
