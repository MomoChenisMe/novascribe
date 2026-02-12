/**
 * @file Email 唯一性約束測試
 * @description 驗證 User model 的 email 欄位具有 @unique 約束。
 *   透過靜態分析 schema.prisma 驗證，不需要實際的資料庫連線。
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Email 唯一性約束', () => {
  let schemaContent: string;
  let userModelBlock: string;

  beforeAll(() => {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // 擷取 User model 區塊
    const modelMatch = schemaContent.match(
      /model\s+User\s*\{([^}]*)\}/s
    );
    userModelBlock = modelMatch ? modelMatch[1] : '';
  });

  it('schema 中應存在 User model', () => {
    expect(userModelBlock).not.toBe('');
  });

  it('email 欄位應標記為 @unique', () => {
    const emailLine = userModelBlock
      .split('\n')
      .find((line) => line.trim().startsWith('email'));
    expect(emailLine).toBeDefined();
    expect(emailLine).toContain('@unique');
  });

  it('email 欄位的型別應為 String', () => {
    const emailLine = userModelBlock
      .split('\n')
      .find((line) => line.trim().startsWith('email'));
    expect(emailLine).toBeDefined();
    expect(emailLine).toMatch(/email\s+String/);
  });

  it('只有 email 欄位應具有 @unique 約束', () => {
    const uniqueFields = userModelBlock
      .split('\n')
      .filter(
        (line) => line.includes('@unique') && !line.trim().startsWith('//')
      );
    expect(uniqueFields).toHaveLength(1);
    expect(uniqueFields[0]).toMatch(/email/);
  });
});
