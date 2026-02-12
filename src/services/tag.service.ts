/**
 * @file 標籤 Service 層
 * @description 標籤 CRUD、使用次數統計、清理未使用標籤
 *   - createTag：建立標籤（含 slug 去重）
 *   - updateTag：更新標籤
 *   - deleteTag：刪除標籤（Cascade 刪除 PostTag 關聯）
 *   - getTags：取得標籤列表（含使用次數、搜尋、排序、分頁）
 *   - deleteUnusedTags：刪除未使用標籤
 */

import { prisma } from '@/lib/prisma';
import type { Tag } from '@/generated/prisma/client';

export interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 建立標籤
 * @throws 當 slug 已存在時拋出錯誤
 */
export async function createTag(data: {
  name: string;
  slug: string;
}): Promise<Tag> {
  // 檢查 slug 是否已存在
  const existing = await prisma.tag.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error(`Slug "${data.slug}" already exists`);
  }

  return prisma.tag.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
  });
}

/**
 * 更新標籤
 * @throws 當標籤不存在或 slug 重複時拋出錯誤
 */
export async function updateTag(
  id: string,
  data: Partial<{ name: string; slug: string }>
): Promise<Tag> {
  // 檢查標籤是否存在
  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new Error(`Tag "${id}" not found`);
  }

  // 檢查 slug 唯一性（排除自己）
  if (data.slug !== undefined) {
    const existing = await prisma.tag.findUnique({
      where: { slug: data.slug },
    });
    if (existing && existing.id !== id) {
      throw new Error(`Slug "${data.slug}" already exists`);
    }
  }

  return prisma.tag.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
    },
  });
}

/**
 * 刪除標籤
 * - PostTag 關聯會透過 Cascade 自動刪除
 * @throws 當標籤不存在時拋出錯誤
 */
export async function deleteTag(id: string): Promise<void> {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new Error(`Tag "${id}" not found`);
  }

  await prisma.tag.delete({
    where: { id },
  });
}

/**
 * 取得標籤列表（含使用次數）
 * - 支援搜尋（name LIKE）
 * - 支援排序（按使用次數或名稱）
 * - 支援分頁
 */
export async function getTags(options?: {
  search?: string;
  sortBy?: 'name' | 'postCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{
  data: TagWithCount[];
  total: number;
}> {
  const {
    search,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  } = options ?? {};

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : undefined;

  // postCount 排序需要在 JS 中處理，因為 Prisma 不支援直接按 _count 排序加上分頁
  const orderBy =
    sortBy === 'name' ? { name: sortOrder } : undefined;

  const skip = (page - 1) * limit;

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: { _count: { select: { posts: true } } },
      orderBy,
      skip: sortBy === 'postCount' ? undefined : skip,
      take: sortBy === 'postCount' ? undefined : limit,
    }),
    prisma.tag.count({ where }),
  ]);

  // 轉換為 TagWithCount 格式
  let data: TagWithCount[] = tags.map(
    (tag: { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date; _count: { posts: number } }) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: tag._count.posts,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    })
  );

  // postCount 排序需要在 JS 中處理
  if (sortBy === 'postCount') {
    data.sort((a, b) => {
      const diff = a.postCount - b.postCount;
      return sortOrder === 'desc' ? -diff : diff;
    });
    // 手動分頁
    data = data.slice(skip, skip + limit);
  }

  return { data, total };
}

/**
 * 刪除未使用的標籤（沒有任何文章關聯的標籤）
 * @returns 刪除的標籤數量
 */
export async function deleteUnusedTags(): Promise<number> {
  const result = await prisma.tag.deleteMany({
    where: {
      posts: {
        none: {},
      },
    },
  });

  return result.count;
}
