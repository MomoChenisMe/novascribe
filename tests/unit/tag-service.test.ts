/**
 * @file 標籤 Service 層測試
 * @description 測試標籤 CRUD、使用次數統計、清理未使用標籤
 *   - createTag：建立、slug 去重
 *   - updateTag：更新、slug 唯一
 *   - deleteTag：刪除（Cascade 刪除 PostTag）
 *   - getTags：列表、搜尋、排序、分頁、使用次數統計
 *   - deleteUnusedTags：清理未使用標籤
 */

import {
  createTag,
  updateTag,
  deleteTag,
  getTags,
  deleteUnusedTags,
} from '@/services/tag.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock 標籤資料 */
function mockTag(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/** 建立 mock 標籤含使用次數 */
function mockTagWithCount(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    _count: { posts: number };
  }> = {}
) {
  return {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { posts: 3 },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== createTag =====
describe('createTag', () => {
  it('應成功建立標籤', async () => {
    const newTag = mockTag();
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tag.create as jest.Mock).mockResolvedValue(newTag);

    const result = await createTag({ name: 'JavaScript', slug: 'javascript' });

    expect(result).toEqual(newTag);
    expect(mockPrisma.tag.create).toHaveBeenCalledWith({
      data: { name: 'JavaScript', slug: 'javascript' },
    });
  });

  it('應在 slug 已存在時拋出錯誤', async () => {
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(mockTag());

    await expect(
      createTag({ name: 'JavaScript', slug: 'javascript' })
    ).rejects.toThrow('Slug "javascript" already exists');
  });

  it('應在 name 已存在時檢查 slug 唯一性', async () => {
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tag.create as jest.Mock).mockResolvedValue(
      mockTag({ id: 'tag-2', name: 'TypeScript', slug: 'typescript' })
    );

    const result = await createTag({ name: 'TypeScript', slug: 'typescript' });
    expect(result.slug).toBe('typescript');
  });
});

// ===== updateTag =====
describe('updateTag', () => {
  it('應成功更新標籤名稱', async () => {
    const original = mockTag();
    const updated = mockTag({ name: 'JS' });

    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValueOnce(original);
    (mockPrisma.tag.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateTag('tag-1', { name: 'JS' });

    expect(result.name).toBe('JS');
    expect(mockPrisma.tag.update).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
      data: { name: 'JS' },
    });
  });

  it('應在標籤不存在時拋出錯誤', async () => {
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(updateTag('nonexistent', { name: 'JS' })).rejects.toThrow(
      'Tag "nonexistent" not found'
    );
  });

  it('應在 slug 重複時拋出錯誤（排除自己）', async () => {
    const tag1 = mockTag({ id: 'tag-1' });
    const tag2 = mockTag({ id: 'tag-2', slug: 'typescript' });

    (mockPrisma.tag.findUnique as jest.Mock)
      .mockResolvedValueOnce(tag1) // 標籤存在
      .mockResolvedValueOnce(tag2); // slug 被其他標籤使用

    await expect(
      updateTag('tag-1', { slug: 'typescript' })
    ).rejects.toThrow('Slug "typescript" already exists');
  });

  it('應允許更新自己的 slug 為同一個值', async () => {
    const tag = mockTag();
    (mockPrisma.tag.findUnique as jest.Mock)
      .mockResolvedValueOnce(tag) // 標籤存在
      .mockResolvedValueOnce(tag); // 同一個標籤
    (mockPrisma.tag.update as jest.Mock).mockResolvedValue(tag);

    const result = await updateTag('tag-1', { slug: 'javascript' });
    expect(result).toEqual(tag);
  });

  it('應成功更新 slug', async () => {
    const original = mockTag();
    const updated = mockTag({ slug: 'js' });

    (mockPrisma.tag.findUnique as jest.Mock)
      .mockResolvedValueOnce(original) // 標籤存在
      .mockResolvedValueOnce(null); // slug 不存在
    (mockPrisma.tag.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateTag('tag-1', { slug: 'js' });
    expect(result.slug).toBe('js');
  });

  it('應同時更新名稱和 slug', async () => {
    const original = mockTag();
    const updated = mockTag({ name: 'TS', slug: 'ts' });

    (mockPrisma.tag.findUnique as jest.Mock)
      .mockResolvedValueOnce(original) // 標籤存在
      .mockResolvedValueOnce(null); // slug 不存在
    (mockPrisma.tag.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateTag('tag-1', { name: 'TS', slug: 'ts' });
    expect(result.name).toBe('TS');
    expect(result.slug).toBe('ts');
  });
});

// ===== deleteTag =====
describe('deleteTag', () => {
  it('應成功刪除標籤', async () => {
    const tag = mockTag();
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(tag);
    (mockPrisma.tag.delete as jest.Mock).mockResolvedValue(tag);

    await deleteTag('tag-1');

    expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
    });
  });

  it('應在標籤不存在時拋出錯誤', async () => {
    (mockPrisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(deleteTag('nonexistent')).rejects.toThrow(
      'Tag "nonexistent" not found'
    );
  });
});

// ===== getTags =====
describe('getTags', () => {
  it('應回傳標籤列表含使用次數', async () => {
    const tags = [
      mockTagWithCount({ id: 'tag-1', name: 'JavaScript', _count: { posts: 5 } }),
      mockTagWithCount({ id: 'tag-2', name: 'TypeScript', slug: 'typescript', _count: { posts: 3 } }),
    ];

    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue(tags);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(2);

    const result = await getTags();

    expect(result.data).toHaveLength(2);
    expect(result.data[0].postCount).toBe(5);
    expect(result.data[1].postCount).toBe(3);
    expect(result.total).toBe(2);
  });

  it('應支援搜尋功能', async () => {
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([
      mockTagWithCount({ name: 'JavaScript' }),
    ]);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(1);

    await getTags({ search: 'java' });

    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { contains: 'java', mode: 'insensitive' } },
      })
    );
  });

  it('應支援按名稱排序', async () => {
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);

    await getTags({ sortBy: 'name', sortOrder: 'asc' });

    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      })
    );
  });

  it('應支援按使用次數排序', async () => {
    const tags = [
      mockTagWithCount({ id: 'tag-1', name: 'A', _count: { posts: 1 } }),
      mockTagWithCount({ id: 'tag-2', name: 'B', slug: 'b', _count: { posts: 5 } }),
      mockTagWithCount({ id: 'tag-3', name: 'C', slug: 'c', _count: { posts: 3 } }),
    ];

    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue(tags);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(3);

    const result = await getTags({ sortBy: 'postCount', sortOrder: 'desc' });

    expect(result.data[0].postCount).toBe(5);
    expect(result.data[1].postCount).toBe(3);
    expect(result.data[2].postCount).toBe(1);
  });

  it('應支援分頁', async () => {
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([
      mockTagWithCount({ id: 'tag-3', name: 'C', slug: 'c' }),
    ]);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(5);

    const result = await getTags({ page: 2, limit: 2 });

    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 2,
        take: 2,
      })
    );
    expect(result.total).toBe(5);
  });

  it('應使用預設分頁參數', async () => {
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);

    await getTags();

    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      })
    );
  });

  it('應回傳空陣列當沒有標籤', async () => {
    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(0);

    const result = await getTags();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('按使用次數升序排序應正確', async () => {
    const tags = [
      mockTagWithCount({ id: 'tag-1', name: 'A', _count: { posts: 5 } }),
      mockTagWithCount({ id: 'tag-2', name: 'B', slug: 'b', _count: { posts: 1 } }),
      mockTagWithCount({ id: 'tag-3', name: 'C', slug: 'c', _count: { posts: 3 } }),
    ];

    (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue(tags);
    (mockPrisma.tag.count as jest.Mock).mockResolvedValue(3);

    const result = await getTags({ sortBy: 'postCount', sortOrder: 'asc' });

    expect(result.data[0].postCount).toBe(1);
    expect(result.data[1].postCount).toBe(3);
    expect(result.data[2].postCount).toBe(5);
  });
});

// ===== deleteUnusedTags =====
describe('deleteUnusedTags', () => {
  it('應刪除所有未使用的標籤', async () => {
    (mockPrisma.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

    const result = await deleteUnusedTags();

    expect(result).toBe(3);
    expect(mockPrisma.tag.deleteMany).toHaveBeenCalledWith({
      where: {
        posts: {
          none: {},
        },
      },
    });
  });

  it('沒有未使用標籤時應回傳 0', async () => {
    (mockPrisma.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const result = await deleteUnusedTags();

    expect(result).toBe(0);
  });
});
