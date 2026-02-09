/**
 * @file 分類 Service 層
 * @description 分類 CRUD 與樹狀結構邏輯
 *   - createCategory：建立分類（含 slug 去重）
 *   - updateCategory：更新分類（含循環參照檢測）
 *   - deleteCategory：刪除分類（子分類提升、文章解除關聯）
 *   - getCategories：取得扁平分類列表
 *   - getCategoryTree：取得樹狀結構
 *   - detectCircularReference：檢測循環參照
 */

import { prisma } from '@/lib/prisma';
import type { Category } from '@/generated/prisma/client';

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  children: CategoryTreeNode[];
}

/**
 * 建立分類
 * @throws 當 slug 已存在時拋出錯誤
 */
export async function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string;
  sortOrder?: number;
}): Promise<Category> {
  // 檢查 slug 是否已存在
  const existing = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error(`Slug "${data.slug}" already exists`);
  }

  // 若指定 parentId，驗證父分類存在
  if (data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error(`Parent category "${data.parentId}" not found`);
    }
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

/**
 * 更新分類
 * @throws 當分類不存在、slug 重複、或產生循環參照時拋出錯誤
 */
export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    parentId: string | null;
    sortOrder: number;
  }>
): Promise<Category> {
  // 檢查分類是否存在
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error(`Category "${id}" not found`);
  }

  // 檢查 slug 唯一性（排除自己）
  if (data.slug !== undefined) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing && existing.id !== id) {
      throw new Error(`Slug "${data.slug}" already exists`);
    }
  }

  // 檢查循環參照
  if (data.parentId !== undefined && data.parentId !== null) {
    // 不能將自己設為自己的父類
    if (data.parentId === id) {
      throw new Error('Category cannot be its own parent');
    }

    // 檢查父分類是否存在
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error(`Parent category "${data.parentId}" not found`);
    }

    // 檢測循環參照
    const isCircular = await detectCircularReference(id, data.parentId);
    if (isCircular) {
      throw new Error('Circular reference detected');
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

/**
 * 刪除分類
 * - 將子分類的 parentId 設為 null
 * - 將關聯文章的 categoryId 設為 null
 */
export async function deleteCategory(id: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error(`Category "${id}" not found`);
  }

  // 使用 transaction 確保一致性
  await prisma.$transaction([
    // 將子分類的 parentId 設為 null
    prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    }),
    // 將關聯文章的 categoryId 設為 null
    prisma.post.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    }),
    // 刪除分類
    prisma.category.delete({
      where: { id },
    }),
  ]);
}

/**
 * 取得分類列表（扁平，按 sortOrder 排序）
 */
export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

/**
 * 取得分類樹狀結構
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return buildTree(categories);
}

/**
 * 將扁平分類列表轉換為樹狀結構
 */
function buildTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // 建立所有節點的 map
  for (const cat of categories) {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      children: [],
    });
  }

  // 建立樹狀結構
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * 檢測循環參照
 * 從 newParentId 開始往上追溯，若遇到 categoryId 則表示會產生循環
 * @returns true 表示會造成循環
 */
export async function detectCircularReference(
  categoryId: string,
  newParentId: string
): Promise<boolean> {
  // 若 newParentId 就是 categoryId 本身，直接循環
  if (categoryId === newParentId) {
    return true;
  }

  // 取得所有分類，在記憶體中檢測
  const categories = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const parentMap = new Map<string, string | null>();
  for (const cat of categories) {
    parentMap.set(cat.id, cat.parentId);
  }

  // 從 newParentId 開始往上追溯
  let currentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) {
      return true; // 發現循環
    }
    if (visited.has(currentId)) {
      break; // 已訪問過（現有資料中有循環，但與本次無關）
    }
    visited.add(currentId);
    currentId = parentMap.get(currentId) ?? null;
  }

  return false;
}
