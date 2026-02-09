/**
 * @file 儲存策略測試
 * @description 測試本地儲存、S3 儲存、模式切換
 *   - LocalStorageProvider：save（建立目錄、寫入檔案）、delete（刪除、不存在靜默）
 *   - S3StorageProvider：save（呼叫 PutObjectCommand）、delete（呼叫 DeleteObjectCommand）
 *   - getStorageProvider：依環境變數切換策略
 *
 * @jest-environment node
 */

import { promises as fs } from 'fs';
import {
  LocalStorageProvider,
  S3StorageProvider,
  getStorageProvider,
} from '@/lib/storage';

// Mock fs
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock @aws-sdk/client-s3
const mockSend = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({
    ...input,
    _type: 'PutObjectCommand',
  })),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({
    ...input,
    _type: 'DeleteObjectCommand',
  })),
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('儲存策略', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LocalStorageProvider', () => {
    const provider = new LocalStorageProvider('/tmp/test-uploads');

    describe('save', () => {
      it('應建立目錄並寫入檔案', async () => {
        const buffer = Buffer.from('test-image');
        const url = await provider.save('photo.webp', buffer);

        expect(mockFs.mkdir).toHaveBeenCalledWith('/tmp/test-uploads', {
          recursive: true,
        });
        expect(mockFs.writeFile).toHaveBeenCalledWith(
          '/tmp/test-uploads/photo.webp',
          buffer
        );
        expect(url).toBe('/uploads/photo.webp');
      });
    });

    describe('delete', () => {
      it('應刪除指定檔案', async () => {
        await provider.delete('/uploads/photo.webp');

        expect(mockFs.unlink).toHaveBeenCalledWith(
          '/tmp/test-uploads/photo.webp'
        );
      });

      it('檔案不存在時應靜默處理', async () => {
        const enoent = new Error('File not found') as NodeJS.ErrnoException;
        enoent.code = 'ENOENT';
        mockFs.unlink.mockRejectedValueOnce(enoent);

        await expect(
          provider.delete('/uploads/nonexistent.webp')
        ).resolves.toBeUndefined();
      });

      it('非 ENOENT 錯誤應拋出', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.unlink.mockRejectedValueOnce(error);

        await expect(
          provider.delete('/uploads/photo.webp')
        ).rejects.toThrow('Permission denied');
      });
    });
  });

  describe('S3StorageProvider', () => {
    let provider: S3StorageProvider;

    beforeEach(() => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'ap-northeast-1';
      provider = new S3StorageProvider();
    });

    afterEach(() => {
      delete process.env.S3_BUCKET;
      delete process.env.S3_REGION;
    });

    describe('save', () => {
      it('應上傳至 S3 並回傳 URL', async () => {
        const buffer = Buffer.from('test-image');
        const url = await provider.save('photo.webp', buffer);

        expect(mockSend).toHaveBeenCalled();
        expect(url).toBe(
          'https://test-bucket.s3.ap-northeast-1.amazonaws.com/photo.webp'
        );
      });
    });

    describe('delete', () => {
      it('應呼叫 DeleteObjectCommand', async () => {
        await provider.delete(
          'https://test-bucket.s3.ap-northeast-1.amazonaws.com/photo.webp'
        );

        expect(mockSend).toHaveBeenCalled();
      });
    });
  });

  describe('getStorageProvider', () => {
    const originalEnv = process.env.STORAGE_PROVIDER;

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.STORAGE_PROVIDER = originalEnv;
      } else {
        delete process.env.STORAGE_PROVIDER;
      }
    });

    it('預設應回傳 LocalStorageProvider', () => {
      delete process.env.STORAGE_PROVIDER;
      const provider = getStorageProvider();
      expect(provider).toBeInstanceOf(LocalStorageProvider);
    });

    it('STORAGE_PROVIDER=local 應回傳 LocalStorageProvider', () => {
      process.env.STORAGE_PROVIDER = 'local';
      const provider = getStorageProvider();
      expect(provider).toBeInstanceOf(LocalStorageProvider);
    });

    it('STORAGE_PROVIDER=s3 應回傳 S3StorageProvider', () => {
      process.env.STORAGE_PROVIDER = 's3';
      const provider = getStorageProvider();
      expect(provider).toBeInstanceOf(S3StorageProvider);
    });
  });
});
