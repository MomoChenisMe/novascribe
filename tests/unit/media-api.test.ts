/**
 * @file 媒體 API Route Handler 測試
 * @description 測試 /api/admin/media 與 /api/admin/media/[id] 的 API 處理
 *   - GET：取得媒體列表（分頁）
 *   - POST：上傳媒體（multipart/form-data）
 *   - DELETE：刪除媒體
 *   - 認證檢查：未登入應回傳 401
 *   - 錯誤處理：無檔案、格式不支援、大小超限、媒體不存在
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET, POST } from '@/app/api/admin/media/route';
import { DELETE } from '@/app/api/admin/media/[id]/route';
import * as mediaService from '@/services/media.service';

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

// Mock media service
jest.mock('@/services/media.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockMediaService = mediaService as jest.Mocked<typeof mediaService>;

/** 建立 mock Request */
function createRequest(
  method: string,
  options: {
    searchParams?: Record<string, string>;
  } = {}
): Request {
  const url = new URL('http://localhost:3000/api/admin/media');
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString(), { method });
}

/** 建立 multipart/form-data Request */
function createUploadRequest(
  file?: {
    name?: string;
    type?: string;
    content?: string;
  } | null
): Request {
  const formData = new FormData();
  if (file) {
    const blob = new Blob([file.content ?? 'fake-image-data'], {
      type: file.type ?? 'image/png',
    });
    formData.append(
      'file',
      new File([blob], file.name ?? 'test.png', {
        type: file.type ?? 'image/png',
      })
    );
  }
  return new Request('http://localhost:3000/api/admin/media', {
    method: 'POST',
    body: formData,
  });
}

/** Mock Media 記錄 */
function mockMedia(overrides = {}) {
  return {
    id: 'media-1',
    filename: 'photo-123.webp',
    mimeType: 'image/webp',
    size: 1024,
    url: '/uploads/photo-123.webp',
    thumbnailUrl: '/uploads/photo-123-thumb.webp',
    uploadedBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

describe('媒體 API', () => {
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
    });

    it('POST 未登入應回傳 401', async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = createUploadRequest({ name: 'test.png' });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('DELETE 未登入應回傳 401', async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'media-1' }),
      });
      expect(res.status).toBe(401);
    });
  });

  // ===== GET /api/admin/media =====
  describe('GET /api/admin/media', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
    });

    it('應回傳媒體列表與分頁資訊', async () => {
      const data = [mockMedia()];
      mockMediaService.getMediaList.mockResolvedValue({
        data: data as any,
        total: 1,
      });

      const req = createRequest('GET');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toBeDefined();
      expect(body.meta.total).toBe(1);
    });

    it('應傳遞分頁參數', async () => {
      mockMediaService.getMediaList.mockResolvedValue({
        data: [],
        total: 0,
      });

      const req = createRequest('GET', {
        searchParams: { page: '2', limit: '10' },
      });
      await GET(req);

      expect(mockMediaService.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
        })
      );
    });

    it('service 錯誤應回傳 500', async () => {
      mockMediaService.getMediaList.mockRejectedValue(
        new Error('DB error')
      );

      const req = createRequest('GET');
      const res = await GET(req);

      expect(res.status).toBe(500);
    });
  });

  // ===== POST /api/admin/media =====
  describe('POST /api/admin/media', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
    });

    it('應成功上傳媒體', async () => {
      const media = mockMedia();
      mockMediaService.uploadMedia.mockResolvedValue(media as any);

      const req = createUploadRequest({
        name: 'photo.png',
        type: 'image/png',
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it('無檔案時應回傳 400', async () => {
      const req = createUploadRequest(null);
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('No file');
    });

    it('格式不支援應回傳 400', async () => {
      mockMediaService.uploadMedia.mockRejectedValue(
        new Error('Unsupported image format')
      );

      const req = createUploadRequest({
        name: 'doc.pdf',
        type: 'application/pdf',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('檔案過大應回傳 400', async () => {
      mockMediaService.uploadMedia.mockRejectedValue(
        new Error('File size exceeds limit')
      );

      const req = createUploadRequest({ name: 'huge.png' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('其他錯誤應回傳 500', async () => {
      mockMediaService.uploadMedia.mockRejectedValue(
        new Error('Unexpected error')
      );

      const req = createUploadRequest({ name: 'test.png' });
      const res = await POST(req);

      expect(res.status).toBe(500);
    });
  });

  // ===== DELETE /api/admin/media/[id] =====
  describe('DELETE /api/admin/media/[id]', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
    });

    it('應成功刪除媒體', async () => {
      mockMediaService.deleteMedia.mockResolvedValue();

      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'media-1' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('媒體不存在應回傳 404', async () => {
      mockMediaService.deleteMedia.mockRejectedValue(
        new Error('Media not found')
      );

      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(res.status).toBe(404);
    });

    it('其他錯誤應回傳 500', async () => {
      mockMediaService.deleteMedia.mockRejectedValue(
        new Error('Unexpected error')
      );

      const req = createRequest('DELETE');
      const res = await DELETE(req, {
        params: Promise.resolve({ id: 'media-1' }),
      });

      expect(res.status).toBe(500);
    });
  });
});
