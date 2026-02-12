/**
 * @file 匯入匯出 API Route Handler 測試
 * @description 測試匯出端點、批次匯出端點、匯入端點
 *   - POST /api/admin/posts/export：匯出單篇文章
 *   - POST /api/admin/posts/export/batch：批次匯出
 *   - POST /api/admin/posts/import：匯入文章
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { POST as EXPORT } from '@/app/api/admin/posts/export/route';
import { POST as EXPORT_BATCH } from '@/app/api/admin/posts/export/batch/route';
import { POST as IMPORT } from '@/app/api/admin/posts/import/route';
import * as exportService from '@/services/export.service';
import * as importService from '@/services/import.service';

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

// Mock services
jest.mock('@/services/export.service');
jest.mock('@/services/import.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockExportService = exportService as jest.Mocked<typeof exportService>;
const mockImportService = importService as jest.Mocked<typeof importService>;

/** Mock session */
function mockSession() {
  return {
    user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
  };
}

/** 建立 JSON body 的 Request */
function createJsonRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/admin/posts/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** 建立 mock 文章資料 */
function mockPost() {
  return {
    id: 'post-1',
    title: '測試文章',
    slug: 'test-article',
    content: '# 內容',
    excerpt: null,
    coverImage: null,
    status: 'DRAFT',
    publishedAt: null,
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== POST /api/admin/posts/export =====
describe('POST /api/admin/posts/export', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = createJsonRequest({ postId: 'post-1' });
    const response = await EXPORT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('缺少 postId 應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());

    const request = createJsonRequest({});
    const response = await EXPORT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('成功匯出應回傳 Markdown 檔案', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const markdownContent =
      '---\ntitle: "測試文章"\nslug: "test-article"\n---\n\n# 內容';
    mockExportService.exportPost.mockResolvedValue(markdownContent);

    const request = createJsonRequest({ postId: 'post-1' });
    const response = await EXPORT(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8'
    );
    expect(response.headers.get('Content-Disposition')).toContain(
      'attachment'
    );
    expect(response.headers.get('Content-Disposition')).toContain('.md');
    expect(text).toBe(markdownContent);
  });

  it('文章不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockExportService.exportPost.mockRejectedValue(
      new Error('Post "post-1" not found')
    );

    const request = createJsonRequest({ postId: 'post-1' });
    const response = await EXPORT(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

// ===== POST /api/admin/posts/export/batch =====
describe('POST /api/admin/posts/export/batch', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = createJsonRequest({ postIds: ['post-1'] });
    const response = await EXPORT_BATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('缺少 postIds 應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());

    const request = createJsonRequest({});
    const response = await EXPORT_BATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('postIds 不是陣列應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());

    const request = createJsonRequest({ postIds: 'not-an-array' });
    const response = await EXPORT_BATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('成功批次匯出應回傳 ZIP 檔案', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const zipBuffer = Buffer.from('fake-zip-content');
    mockExportService.exportPostsBatch.mockResolvedValue(zipBuffer);

    const request = createJsonRequest({ postIds: ['post-1', 'post-2'] });
    const response = await EXPORT_BATCH(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/zip');
    expect(response.headers.get('Content-Disposition')).toContain(
      'attachment'
    );
    expect(response.headers.get('Content-Disposition')).toContain(
      'posts.zip'
    );

    const buffer = await response.arrayBuffer();
    expect(Buffer.from(buffer)).toEqual(zipBuffer);
  });
});

// ===== POST /api/admin/posts/import =====
describe('POST /api/admin/posts/import', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const formData = new FormData();
    formData.append(
      'file',
      new Blob(['# test'], { type: 'text/markdown' }),
      'test.md'
    );

    const request = new Request('http://localhost:3000/api/admin/posts/import', {
      method: 'POST',
      body: formData,
    });

    const response = await IMPORT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('缺少 file 欄位應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());

    const formData = new FormData();

    const request = new Request('http://localhost:3000/api/admin/posts/import', {
      method: 'POST',
      body: formData,
    });

    const response = await IMPORT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('成功匯入應回傳文章資料', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const post = mockPost();
    mockImportService.importPost.mockResolvedValue(post as any);

    const markdownContent = `---
title: "測試文章"
slug: "test-article"
---

# 內容
`;

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([markdownContent], { type: 'text/markdown' }),
      'test.md'
    );

    const request = new Request('http://localhost:3000/api/admin/posts/import', {
      method: 'POST',
      body: formData,
    });

    const response = await IMPORT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(mockImportService.importPost).toHaveBeenCalledWith(
      markdownContent,
      'user-1'
    );
  });

  it('匯入失敗應回傳 400', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockImportService.importPost.mockRejectedValue(
      new Error('Missing required field: title')
    );

    const formData = new FormData();
    formData.append(
      'file',
      new Blob(['no front matter'], { type: 'text/markdown' }),
      'test.md'
    );

    const request = new Request('http://localhost:3000/api/admin/posts/import', {
      method: 'POST',
      body: formData,
    });

    const response = await IMPORT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('title');
  });
});
