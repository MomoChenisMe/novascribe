/**
 * @file 媒體 Service 層測試
 * @description 測試上傳流程、列表查詢、刪除（含實體檔案）
 *   - uploadMedia：格式驗證、大小驗證、壓縮、縮圖、儲存、DB 記錄
 *   - getMediaList：分頁、篩選
 *   - deleteMedia：刪除實體檔案 + DB 記錄、不存在的 media
 *
 * @jest-environment node
 */

import { uploadMedia, getMediaList, deleteMedia } from '@/services/media.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    media: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock image processor
jest.mock('@/lib/image-processor', () => ({
  processImage: jest.fn().mockResolvedValue(Buffer.from('processed')),
  generateThumbnail: jest.fn().mockResolvedValue(Buffer.from('thumbnail')),
  validateImageFormat: jest.fn().mockReturnValue(true),
  validateImageSize: jest.fn().mockReturnValue(true),
}));

// Mock storage
const mockSave = jest.fn();
const mockDelete = jest.fn();
jest.mock('@/lib/storage', () => ({
  getStorageProvider: jest.fn(() => ({
    save: mockSave,
    delete: mockDelete,
  })),
}));

// Import mocked modules
import * as imageProcessor from '@/lib/image-processor';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockValidateFormat = imageProcessor.validateImageFormat as jest.Mock;
const mockValidateSize = imageProcessor.validateImageSize as jest.Mock;

/** Mock Media 記錄 */
function createMockMedia(overrides = {}) {
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

describe('媒體 Service 層', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateFormat.mockReturnValue(true);
    mockValidateSize.mockReturnValue(true);
    mockSave.mockImplementation((filename: string) =>
      Promise.resolve(`/uploads/${filename}`)
    );
    mockDelete.mockResolvedValue(undefined);
  });

  describe('uploadMedia', () => {
    const validInput = {
      buffer: Buffer.from('test-image'),
      filename: 'photo.png',
      mimeType: 'image/png',
      size: 1024,
      uploadedBy: 'user-1',
    };

    it('應成功上傳媒體', async () => {
      const mockMedia = createMockMedia();
      (mockPrisma.media.create as jest.Mock).mockResolvedValue(mockMedia);

      const result = await uploadMedia(validInput);

      expect(result).toEqual(mockMedia);
      expect(imageProcessor.processImage).toHaveBeenCalled();
      expect(imageProcessor.generateThumbnail).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledTimes(2); // 原圖 + 縮圖
      expect(mockPrisma.media.create).toHaveBeenCalledTimes(1);
    });

    it('格式不支援時應拋出錯誤', async () => {
      mockValidateFormat.mockReturnValue(false);

      await expect(uploadMedia(validInput)).rejects.toThrow(
        'Unsupported image format'
      );
    });

    it('檔案過大時應拋出錯誤', async () => {
      mockValidateSize.mockReturnValue(false);

      await expect(uploadMedia(validInput)).rejects.toThrow(
        'File size exceeds limit'
      );
    });

    it('應使用處理後的 buffer 大小作為 DB 記錄的 size', async () => {
      const mockMedia = createMockMedia();
      (mockPrisma.media.create as jest.Mock).mockResolvedValue(mockMedia);

      await uploadMedia(validInput);

      const createCall = (mockPrisma.media.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.size).toBe(Buffer.from('processed').length);
    });

    it('應儲存原圖與縮圖', async () => {
      const mockMedia = createMockMedia();
      (mockPrisma.media.create as jest.Mock).mockResolvedValue(mockMedia);

      await uploadMedia(validInput);

      // 第一次 save 為原圖，第二次為縮圖
      expect(mockSave).toHaveBeenCalledTimes(2);
      const [originalFilename] = mockSave.mock.calls[0];
      const [thumbFilename] = mockSave.mock.calls[1];
      expect(originalFilename).toContain('photo');
      expect(thumbFilename).toContain('thumb');
    });
  });

  describe('getMediaList', () => {
    it('應回傳分頁媒體列表', async () => {
      const mockData = [createMockMedia()];
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue(mockData);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await getMediaList({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    it('應使用預設分頁參數', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      await getMediaList();

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        })
      );
    });

    it('應支援按 uploadedBy 篩選', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      await getMediaList({ uploadedBy: 'user-1' });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { uploadedBy: 'user-1' },
        })
      );
    });

    it('應依建立時間降序排列', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      await getMediaList();

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('第 2 頁應正確計算 skip', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(25);

      await getMediaList({ page: 2, limit: 10 });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('deleteMedia', () => {
    it('應刪除實體檔案與 DB 記錄', async () => {
      const mockMedia = createMockMedia();
      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(mockMedia);
      (mockPrisma.media.delete as jest.Mock).mockResolvedValue(mockMedia);

      await deleteMedia('media-1');

      expect(mockDelete).toHaveBeenCalledWith('/uploads/photo-123.webp');
      expect(mockDelete).toHaveBeenCalledWith('/uploads/photo-123-thumb.webp');
      expect(mockPrisma.media.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
    });

    it('media 不存在時應拋出錯誤', async () => {
      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteMedia('nonexistent')).rejects.toThrow(
        'Media not found'
      );
    });

    it('沒有縮圖時只刪除原圖', async () => {
      const mockMedia = createMockMedia({ thumbnailUrl: null });
      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(mockMedia);
      (mockPrisma.media.delete as jest.Mock).mockResolvedValue(mockMedia);

      await deleteMedia('media-1');

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith('/uploads/photo-123.webp');
    });
  });
});
