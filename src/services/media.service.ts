/**
 * @file 媒體 Service 層
 * @description 媒體上傳、列表查詢、刪除邏輯。
 *   - uploadMedia：驗證格式與大小 → 壓縮 → 生成縮圖 → 儲存 → 建立 DB 記錄
 *   - getMediaList：分頁查詢媒體列表
 *   - deleteMedia：刪除實體檔案（原圖 + 縮圖）＋ DB 記錄
 */

import { prisma } from '@/lib/prisma';
import {
  processImage,
  generateThumbnail,
  validateImageFormat,
  validateImageSize,
} from '@/lib/image-processor';
import { getStorageProvider } from '@/lib/storage';
import type { Media } from '@/generated/prisma/client';

/** 上傳媒體輸入 */
export interface UploadMediaInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
}

/**
 * 上傳媒體
 * - 驗證格式與大小
 * - 壓縮圖片
 * - 生成縮圖
 * - 儲存至 storage provider
 * - 建立 Media 記錄
 */
export async function uploadMedia(input: UploadMediaInput): Promise<Media> {
  const { buffer, filename, mimeType, size, uploadedBy } = input;

  // 驗證格式
  if (!validateImageFormat(mimeType)) {
    throw new Error('Unsupported image format');
  }

  // 驗證大小
  if (!validateImageSize(size)) {
    throw new Error('File size exceeds limit');
  }

  const storage = getStorageProvider();

  // 生成唯一檔名
  const timestamp = Date.now();
  const ext = 'webp';
  const baseName = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${baseName}-${timestamp}.${ext}`;
  const thumbName = `${baseName}-${timestamp}-thumb.${ext}`;

  // 壓縮圖片
  const processedBuffer = await processImage(buffer);

  // 生成縮圖
  const thumbnailBuffer = await generateThumbnail(buffer);

  // 儲存原圖與縮圖
  const url = await storage.save(uniqueName, processedBuffer);
  const thumbnailUrl = await storage.save(thumbName, thumbnailBuffer);

  // 建立 DB 記錄
  const media = await prisma.media.create({
    data: {
      filename: uniqueName,
      mimeType: `image/${ext}`,
      size: processedBuffer.length,
      url,
      thumbnailUrl,
      uploadedBy,
    },
  });

  return media;
}

/**
 * 取得媒體列表（支援分頁）
 */
export async function getMediaList(options?: {
  page?: number;
  limit?: number;
  uploadedBy?: string;
}): Promise<{
  data: Media[];
  total: number;
}> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = options?.uploadedBy
    ? { uploadedBy: options.uploadedBy }
    : {};

  const [data, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.media.count({ where }),
  ]);

  return { data, total };
}

/**
 * 刪除媒體
 * - 刪除實體檔案（原圖 + 縮圖）
 * - 刪除 DB 記錄
 */
export async function deleteMedia(id: string): Promise<void> {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw new Error('Media not found');
  }

  const storage = getStorageProvider();

  // 刪除實體檔案
  await storage.delete(media.url);
  if (media.thumbnailUrl) {
    await storage.delete(media.thumbnailUrl);
  }

  // 刪除 DB 記錄
  await prisma.media.delete({ where: { id } });
}
