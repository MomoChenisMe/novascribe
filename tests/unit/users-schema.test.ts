/**
 * @file Users 資料表結構驗證測試
 * @description 透過讀取 Prisma schema 檔案驗證 User model 的欄位定義、索引與約束。
 *   不需要實際的資料庫連線。
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Users Schema 結構驗證', () => {
  let schemaContent: string;

  beforeAll(() => {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  });

  it('應定義 User model', () => {
    expect(schemaContent).toMatch(/model\s+User\s*\{/);
  });

  it('應將 User model 映射到 "users" 資料表', () => {
    expect(schemaContent).toMatch(/@@map\("users"\)/);
  });

  describe('欄位定義', () => {
    it('應包含 id 欄位（String, @id, @default(cuid())）', () => {
      expect(schemaContent).toMatch(
        /id\s+String\s+@id\s+@default\(cuid\(\)\)/
      );
    });

    it('應包含 email 欄位（String, @unique）', () => {
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
    });

    it('應包含 name 欄位（String?, 可選）', () => {
      expect(schemaContent).toMatch(/name\s+String\?/);
    });

    it('應包含 passwordHash 欄位（String, @map("password_hash")）', () => {
      expect(schemaContent).toMatch(/passwordHash\s+String\s+@map\("password_hash"\)/);
    });

    it('應包含 createdAt 欄位（DateTime, @default(now()), @map("created_at")）', () => {
      expect(schemaContent).toMatch(
        /createdAt\s+DateTime\s+@default\(now\(\)\)\s+@map\("created_at"\)/
      );
    });

    it('應包含 updatedAt 欄位（DateTime, @updatedAt, @map("updated_at")）', () => {
      expect(schemaContent).toMatch(/updatedAt\s+DateTime\s+@updatedAt\s+@map\("updated_at"\)/);
    });
  });

  describe('索引與約束', () => {
    it('email 欄位應有 @unique 約束', () => {
      const emailLine = schemaContent
        .split('\n')
        .find((line) => line.trim().startsWith('email'));
      expect(emailLine).toBeDefined();
      expect(emailLine).toContain('@unique');
    });

    it('id 欄位應有 @id 標記', () => {
      const idLine = schemaContent
        .split('\n')
        .find((line) => line.trim().startsWith('id '));
      expect(idLine).toBeDefined();
      expect(idLine).toContain('@id');
    });
  });

  describe('資料庫設定', () => {
    it('應使用 PostgreSQL 作為資料來源', () => {
      expect(schemaContent).toMatch(/provider\s*=\s*"postgresql"/);
    });
  });
});
