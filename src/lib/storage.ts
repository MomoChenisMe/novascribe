/**
 * @file 儲存策略
 * @description Strategy Pattern 實作本地與 S3 雙模式檔案儲存。
 *   - StorageProvider 介面：save / delete
 *   - LocalStorageProvider：儲存至 public/uploads/
 *   - S3StorageProvider：上傳至 AWS S3
 *   - getStorageProvider：根據環境變數 STORAGE_PROVIDER 選擇策略
 */

import { promises as fs } from 'fs';
import path from 'path';

/** 儲存策略介面 */
export interface StorageProvider {
  /** 儲存檔案，回傳 URL */
  save(filename: string, buffer: Buffer): Promise<string>;
  /** 刪除檔案 */
  delete(url: string): Promise<void>;
}

/** 本地儲存策略 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir =
      uploadDir ?? path.join(process.cwd(), 'public', 'uploads');
  }

  async save(filename: string, buffer: Buffer): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // URL 格式：/uploads/filename
    const filename = url.replace(/^\/uploads\//, '');
    const filePath = path.join(this.uploadDir, filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 檔案不存在時靜默處理
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

/** S3 儲存策略 */
export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private client: import('@aws-sdk/client-s3').S3Client | null = null;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? '';
    this.region = process.env.S3_REGION ?? 'us-east-1';
  }

  private async getClient(): Promise<import('@aws-sdk/client-s3').S3Client> {
    if (!this.client) {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.client = new S3Client({ region: this.region });
    }
    return this.client;
  }

  async save(filename: string, buffer: Buffer): Promise<string> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
      })
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();

    // 從 URL 提取 key
    const key = url.replace(
      `https://${this.bucket}.s3.${this.region}.amazonaws.com/`,
      ''
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}

/**
 * 取得儲存策略（根據環境變數 STORAGE_PROVIDER）
 * - 'local'（預設）：使用本地儲存
 * - 's3'：使用 S3 儲存
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';

  switch (provider) {
    case 's3':
      return new S3StorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}
