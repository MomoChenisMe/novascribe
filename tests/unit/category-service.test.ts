/**
 * @file 分類 Service 層測試
 * @description 測試分類 CRUD、樹狀結構、循環參照檢測
 *   - createCategory：建立、slug 去重、parentId 驗證
 *   - updateCategory：更新、slug 唯一、循環參照檢測
 *   - deleteCategory：刪除、子分類提升、文章解除關聯
 *   - getCategories：扁平列表
 *   - getCategoryTree：樹狀結構
 *   - detectCircularReference：循環參照檢測
 */

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryTree,
  detectCircularReference,
} from '@/services/category.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock 分類資料 */
function mockCategory(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: 'cat-1',
    name: '技術',
    slug: 'tech',
    parentId: null,
    sortOrder: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== createCategory =====
describe('createCategory', () => {
  it('應成功建立分類', async () => {
    const newCat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.category.create as jest.Mock).mockResolvedValue(newCat);

    const result = await createCategory({ name: '技術', slug: 'tech' });

    expect(result).toEqual(newCat);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        name: '技術',
        slug: 'tech',
        parentId: null,
        sortOrder: 0,
      },
    });
  });

  it('應在 slug 已存在時拋出錯誤', async () => {
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory());

    await expect(
      createCategory({ name: '技術', slug: 'tech' })
    ).rejects.toThrow('Slug "tech" already exists');
  });

  it('應支援指定 parentId', async () => {
    const parent = mockCategory({ id: 'parent-1' });
    const child = mockCategory({
      id: 'child-1',
      name: '前端',
      slug: 'frontend',
      parentId: 'parent-1',
    });

    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // slug 不存在
      .mockResolvedValueOnce(parent); // parent 存在
    (mockPrisma.category.create as jest.Mock).mockResolvedValue(child);

    const result = await createCategory({
      name: '前端',
      slug: 'frontend',
      parentId: 'parent-1',
    });

    expect(result.parentId).toBe('parent-1');
  });

  it('應在 parentId 不存在時拋出錯誤', async () => {
    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // slug 不存在
      .mockResolvedValueOnce(null); // parent 不存在

    await expect(
      createCategory({
        name: '前端',
        slug: 'frontend',
        parentId: 'nonexistent',
      })
    ).rejects.toThrow('Parent category "nonexistent" not found');
  });

  it('應支援指定 sortOrder', async () => {
    const newCat = mockCategory({ sortOrder: 5 });
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.category.create as jest.Mock).mockResolvedValue(newCat);

    await createCategory({ name: '技術', slug: 'tech', sortOrder: 5 });

    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sortOrder: 5 }),
    });
  });
});

// ===== updateCategory =====
describe('updateCategory', () => {
  it('應成功更新分類名稱', async () => {
    const original = mockCategory();
    const updated = mockCategory({ name: '科技' });

    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(original);
    (mockPrisma.category.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateCategory('cat-1', { name: '科技' });

    expect(result.name).toBe('科技');
    expect(mockPrisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { name: '科技' },
    });
  });

  it('應在分類不存在時拋出錯誤', async () => {
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updateCategory('nonexistent', { name: '科技' })
    ).rejects.toThrow('Category "nonexistent" not found');
  });

  it('應在 slug 重複時拋出錯誤（排除自己）', async () => {
    const cat1 = mockCategory({ id: 'cat-1' });
    const cat2 = mockCategory({ id: 'cat-2', slug: 'science' });

    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(cat1) // 分類存在
      .mockResolvedValueOnce(cat2); // slug 被其他分類使用

    await expect(
      updateCategory('cat-1', { slug: 'science' })
    ).rejects.toThrow('Slug "science" already exists');
  });

  it('應允許更新自己的 slug 為同一個值', async () => {
    const cat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(cat) // 分類存在
      .mockResolvedValueOnce(cat); // 同一個分類
    (mockPrisma.category.update as jest.Mock).mockResolvedValue(cat);

    const result = await updateCategory('cat-1', { slug: 'tech' });
    expect(result).toEqual(cat);
  });

  it('應在設為自己的 parent 時拋出錯誤', async () => {
    const cat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(cat);

    await expect(
      updateCategory('cat-1', { parentId: 'cat-1' })
    ).rejects.toThrow('Category cannot be its own parent');
  });

  it('應在循環參照時拋出錯誤', async () => {
    // cat-1 -> cat-2 -> cat-3，把 cat-1 的 parentId 設為 cat-3
    const cat1 = mockCategory({ id: 'cat-1', parentId: null });
    const parent = mockCategory({ id: 'cat-3' });

    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(cat1) // 分類存在
      .mockResolvedValueOnce(parent); // parent 存在

    // detectCircularReference 需要 findMany
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: 'cat-1' },
      { id: 'cat-3', parentId: 'cat-2' },
    ]);

    await expect(
      updateCategory('cat-1', { parentId: 'cat-3' })
    ).rejects.toThrow('Circular reference detected');
  });

  it('應允許設定有效的 parentId', async () => {
    const cat = mockCategory({ id: 'cat-2' });
    const parent = mockCategory({ id: 'cat-1' });
    const updated = mockCategory({ id: 'cat-2', parentId: 'cat-1' });

    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(cat) // 分類存在
      .mockResolvedValueOnce(parent); // parent 存在

    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: null },
    ]);

    (mockPrisma.category.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateCategory('cat-2', { parentId: 'cat-1' });
    expect(result.parentId).toBe('cat-1');
  });

  it('應允許將 parentId 設為 null（移到根層級）', async () => {
    const cat = mockCategory({ id: 'cat-2', parentId: 'cat-1' });
    const updated = mockCategory({ id: 'cat-2', parentId: null });

    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(cat);
    (mockPrisma.category.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateCategory('cat-2', { parentId: null });
    expect(result.parentId).toBeNull();
  });

  it('應在 parentId 不存在時拋出錯誤', async () => {
    const cat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock)
      .mockResolvedValueOnce(cat) // 分類存在
      .mockResolvedValueOnce(null); // parent 不存在

    await expect(
      updateCategory('cat-1', { parentId: 'nonexistent' })
    ).rejects.toThrow('Parent category "nonexistent" not found');
  });
});

// ===== deleteCategory =====
describe('deleteCategory', () => {
  it('應成功刪除分類', async () => {
    const cat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(cat);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([]);

    await deleteCategory('cat-1');

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    // 驗證 transaction 傳入的是一個陣列（含 3 個操作）
    const transactionArg = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(transactionArg).toHaveLength(3);
  });

  it('應在分類不存在時拋出錯誤', async () => {
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(deleteCategory('nonexistent')).rejects.toThrow(
      'Category "nonexistent" not found'
    );
  });

  it('刪除時應將子分類的 parentId 設為 null', async () => {
    const cat = mockCategory();
    (mockPrisma.category.findUnique as jest.Mock).mockResolvedValue(cat);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([]);

    await deleteCategory('cat-1');

    // 驗證 transaction 中包含更新子分類
    const transactionCalls = (mockPrisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(transactionCalls).toHaveLength(3);
  });
});

// ===== getCategories =====
describe('getCategories', () => {
  it('應回傳按 sortOrder 排序的分類列表', async () => {
    const categories = [
      mockCategory({ id: 'cat-1', name: 'A', sortOrder: 0 }),
      mockCategory({ id: 'cat-2', name: 'B', sortOrder: 1 }),
    ];
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue(categories);

    const result = await getCategories();

    expect(result).toEqual(categories);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  });

  it('應回傳空陣列當沒有分類', async () => {
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getCategories();
    expect(result).toEqual([]);
  });
});

// ===== getCategoryTree =====
describe('getCategoryTree', () => {
  it('應將扁平列表轉為樹狀結構', async () => {
    const categories = [
      mockCategory({ id: 'cat-1', name: '技術', slug: 'tech', parentId: null, sortOrder: 0 }),
      mockCategory({ id: 'cat-2', name: '前端', slug: 'frontend', parentId: 'cat-1', sortOrder: 0 }),
      mockCategory({ id: 'cat-3', name: 'React', slug: 'react', parentId: 'cat-2', sortOrder: 0 }),
      mockCategory({ id: 'cat-4', name: '生活', slug: 'life', parentId: null, sortOrder: 1 }),
    ];
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue(categories);

    const result = await getCategoryTree();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('技術');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].name).toBe('前端');
    expect(result[0].children[0].children).toHaveLength(1);
    expect(result[0].children[0].children[0].name).toBe('React');
    expect(result[1].name).toBe('生活');
    expect(result[1].children).toHaveLength(0);
  });

  it('應回傳空陣列當沒有分類', async () => {
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getCategoryTree();
    expect(result).toEqual([]);
  });

  it('所有節點都沒有 parentId 時應全部為根節點', async () => {
    const categories = [
      mockCategory({ id: 'cat-1', name: 'A', parentId: null }),
      mockCategory({ id: 'cat-2', name: 'B', parentId: null }),
    ];
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue(categories);

    const result = await getCategoryTree();
    expect(result).toHaveLength(2);
    expect(result[0].children).toHaveLength(0);
    expect(result[1].children).toHaveLength(0);
  });

  it('樹節點不應包含 createdAt 和 updatedAt', async () => {
    const categories = [
      mockCategory({ id: 'cat-1', parentId: null }),
    ];
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue(categories);

    const result = await getCategoryTree();

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('slug');
    expect(result[0]).toHaveProperty('parentId');
    expect(result[0]).toHaveProperty('sortOrder');
    expect(result[0]).toHaveProperty('children');
    expect(result[0]).not.toHaveProperty('createdAt');
    expect(result[0]).not.toHaveProperty('updatedAt');
  });
});

// ===== detectCircularReference =====
describe('detectCircularReference', () => {
  it('設自己為 parent 應回傳 true', async () => {
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
    ]);

    const result = await detectCircularReference('cat-1', 'cat-1');
    expect(result).toBe(true);
  });

  it('設子孫為 parent 應回傳 true', async () => {
    // cat-1 -> cat-2 -> cat-3
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: 'cat-1' },
      { id: 'cat-3', parentId: 'cat-2' },
    ]);

    // 把 cat-1 的 parent 設為 cat-3（其孫子）
    const result = await detectCircularReference('cat-1', 'cat-3');
    expect(result).toBe(true);
  });

  it('設無關節點為 parent 應回傳 false', async () => {
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: null },
      { id: 'cat-3', parentId: 'cat-2' },
    ]);

    // cat-1 和 cat-3 無父子關係
    const result = await detectCircularReference('cat-1', 'cat-3');
    expect(result).toBe(false);
  });

  it('設父節點為子節點的 parent 應回傳 false（正常的多層結構）', async () => {
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: null },
    ]);

    // cat-2 設 parent 為 cat-1（無循環）
    const result = await detectCircularReference('cat-2', 'cat-1');
    expect(result).toBe(false);
  });

  it('深層循環應能檢測', async () => {
    // cat-1 -> cat-2 -> cat-3 -> cat-4 -> cat-5
    (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', parentId: null },
      { id: 'cat-2', parentId: 'cat-1' },
      { id: 'cat-3', parentId: 'cat-2' },
      { id: 'cat-4', parentId: 'cat-3' },
      { id: 'cat-5', parentId: 'cat-4' },
    ]);

    // 把 cat-1 的 parent 設為 cat-5
    const result = await detectCircularReference('cat-1', 'cat-5');
    expect(result).toBe(true);
  });
});
