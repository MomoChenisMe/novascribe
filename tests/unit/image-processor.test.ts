/**
 * @file 圖片處理工具測試
 * @description 測試圖片壓縮、縮圖生成、格式驗證、大小驗證
 *   - processImage：壓縮品質、尺寸限制、格式轉換
 *   - generateThumbnail：正方形縮圖、自訂尺寸
 *   - validateImageFormat：支援格式、不支援格式
 *   - validateImageSize：合法大小、超過限制、邊界值
 *
 * @jest-environment node
 */

import sharp from 'sharp';
import {
  processImage,
  generateThumbnail,
  validateImageFormat,
  validateImageSize,
} from '@/lib/image-processor';

/** 建立測試用圖片 buffer（使用 sharp 生成純色圖） */
async function createTestImage(
  width = 800,
  height = 600,
  format: 'png' | 'jpeg' | 'webp' = 'png'
): Promise<Buffer> {
  const channels = format === 'jpeg' ? 3 : 4;
  const raw = Buffer.alloc(width * height * channels, 128);
  let pipeline = sharp(raw, {
    raw: { width, height, channels: channels as 3 | 4 },
  });

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg();
      break;
    case 'png':
      pipeline = pipeline.png();
      break;
    case 'webp':
      pipeline = pipeline.webp();
      break;
  }

  return pipeline.toBuffer();
}

describe('圖片處理工具', () => {
  describe('processImage', () => {
    it('應壓縮圖片並轉換為 webp 格式（預設）', async () => {
      const input = await createTestImage(800, 600, 'png');
      const result = await processImage(input);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // 驗證輸出格式為 webp
      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe('webp');
    });

    it('應限制尺寸且保持長寬比', async () => {
      const input = await createTestImage(3000, 2000);
      const result = await processImage(input, {
        maxWidth: 1920,
        maxHeight: 1080,
      });

      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBeLessThanOrEqual(1920);
      expect(metadata.height).toBeLessThanOrEqual(1080);
    });

    it('不應放大小於限制的圖片', async () => {
      const input = await createTestImage(400, 300);
      const result = await processImage(input, {
        maxWidth: 1920,
        maxHeight: 1080,
      });

      const metadata = await sharp(result).metadata();
      expect(metadata.width).toBeLessThanOrEqual(400);
      expect(metadata.height).toBeLessThanOrEqual(300);
    });

    it('應依指定格式輸出 jpeg', async () => {
      const input = await createTestImage(800, 600);
      const result = await processImage(input, { format: 'jpeg' });

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe('jpeg');
    });

    it('應依指定格式輸出 png', async () => {
      const input = await createTestImage(800, 600);
      const result = await processImage(input, { format: 'png' });

      const metadata = await sharp(result).metadata();
      expect(metadata.format).toBe('png');
    });

    it('應使用自訂品質參數', async () => {
      const input = await createTestImage(800, 600);
      const highQ = await processImage(input, {
        quality: 100,
        format: 'jpeg',
      });
      const lowQ = await processImage(input, {
        quality: 10,
        format: 'jpeg',
      });

      // 低品質應更小
      expect(lowQ.length).toBeLessThan(highQ.length);
    });

    it('應使用預設參數', async () => {
      const input = await createTestImage(800, 600);
      const result = await processImage(input);

      // 不應拋出錯誤
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateThumbnail', () => {
    it('應生成 200x200 縮圖（預設）', async () => {
      const input = await createTestImage(800, 600);
      const thumb = await generateThumbnail(input);

      const metadata = await sharp(thumb).metadata();
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(200);
    });

    it('應生成自訂尺寸縮圖', async () => {
      const input = await createTestImage(800, 600);
      const thumb = await generateThumbnail(input, 100);

      const metadata = await sharp(thumb).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    });

    it('縮圖應為 webp 格式', async () => {
      const input = await createTestImage(800, 600);
      const thumb = await generateThumbnail(input);

      const metadata = await sharp(thumb).metadata();
      expect(metadata.format).toBe('webp');
    });
  });

  describe('validateImageFormat', () => {
    it.each([
      ['image/jpeg', true],
      ['image/png', true],
      ['image/webp', true],
      ['image/gif', true],
    ])('應接受 %s', (mimeType, expected) => {
      expect(validateImageFormat(mimeType)).toBe(expected);
    });

    it.each([
      ['application/pdf', false],
      ['text/plain', false],
      ['image/svg+xml', false],
      ['video/mp4', false],
      ['', false],
    ])('應拒絕 %s', (mimeType, expected) => {
      expect(validateImageFormat(mimeType)).toBe(expected);
    });
  });

  describe('validateImageSize', () => {
    it('應接受合法大小（10MB 以內）', () => {
      expect(validateImageSize(1024)).toBe(true); // 1KB
      expect(validateImageSize(1024 * 1024)).toBe(true); // 1MB
      expect(validateImageSize(5 * 1024 * 1024)).toBe(true); // 5MB
    });

    it('應接受剛好 10MB', () => {
      expect(validateImageSize(10 * 1024 * 1024)).toBe(true);
    });

    it('應拒絕超過 10MB', () => {
      expect(validateImageSize(10 * 1024 * 1024 + 1)).toBe(false);
      expect(validateImageSize(20 * 1024 * 1024)).toBe(false);
    });

    it('應拒絕 0 或負數', () => {
      expect(validateImageSize(0)).toBe(false);
      expect(validateImageSize(-1)).toBe(false);
    });

    it('應支援自訂 maxMB', () => {
      expect(validateImageSize(3 * 1024 * 1024, 5)).toBe(true);
      expect(validateImageSize(6 * 1024 * 1024, 5)).toBe(false);
    });
  });
});
