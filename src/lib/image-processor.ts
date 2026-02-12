/**
 * @file 圖片處理工具
 * @description 使用 sharp 進行圖片壓縮、縮圖生成、格式驗證、大小驗證。
 *   - processImage：壓縮圖片（限制尺寸、壓縮品質）
 *   - generateThumbnail：生成正方形縮圖
 *   - validateImageFormat：驗證 MIME type 是否為支援的圖片格式
 *   - validateImageSize：驗證檔案大小是否在限制內
 */

import sharp from 'sharp';

/** 支援的圖片 MIME types */
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/** 圖片處理選項 */
export interface ProcessImageOptions {
  /** 壓縮品質 0-100 */
  quality?: number;
  /** 最大寬度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 輸出格式 */
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * 壓縮圖片
 * - 限制尺寸（保持長寬比）
 * - 壓縮品質
 */
export async function processImage(
  buffer: Buffer,
  options?: ProcessImageOptions
): Promise<Buffer> {
  const {
    quality = 80,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
  } = options ?? {};

  let pipeline = sharp(buffer).resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}

/**
 * 生成縮圖
 * @param buffer 原始圖片 buffer
 * @param size 縮圖尺寸（正方形邊長），預設 200
 */
export async function generateThumbnail(
  buffer: Buffer,
  size = 200
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 70 })
    .toBuffer();
}

/**
 * 驗證圖片格式
 * @param mimeType MIME type 字串
 * @returns 是否為支援的圖片格式
 */
export function validateImageFormat(mimeType: string): boolean {
  return SUPPORTED_FORMATS.includes(mimeType);
}

/**
 * 驗證圖片大小
 * @param size 檔案大小（bytes）
 * @param maxMB 最大 MB 數，預設 10
 * @returns 是否在限制內
 */
export function validateImageSize(size: number, maxMB = 10): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return size > 0 && size <= maxBytes;
}
