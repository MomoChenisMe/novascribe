/**
 * @file 文章 Service 層
 * @description 文章 CRUD、查詢、狀態切換、批次操作
 *   - createPost：建立文章（含自動版本）
 *   - updatePost：更新文章（含自動版本遞增）
 *   - deletePost：刪除文章（Cascade 刪除版本和標籤關聯）
 *   - getPostById：取得單篇文章（含關聯）
 *   - getPosts：取得文章列表（分頁/篩選/搜尋/排序）
 *   - updatePostStatus：文章狀態切換（含狀態機驗證）
 *   - batchDeletePosts：批次刪除
 *   - batchPublishPosts：批次發佈
 *   - batchArchivePosts：批次下架
 */

import { prisma } from '@/lib/prisma';
import type { Post, PostStatus } from '@/generated/prisma/client';

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  categoryId?: string;
  tagIds?: string[];
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string | null;
  tagIds?: string[];
}

export interface GetPostsOptions {
  page?: number;
  limit?: number;
  status?: PostStatus;
  categoryId?: string;
  tagId?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  authorId?: string;
}

/** 有效的狀態轉換映射 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'SCHEDULED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  SCHEDULED: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

/**
 * 建立文章
 * - 自動建立第一個版本（version=1）
 * - 處理標籤關聯（PostTag）
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    status = 'DRAFT' as PostStatus,
    publishedAt,
    scheduledAt,
    categoryId,
    tagIds,
    authorId,
  } = input;

  // 檢查 slug 唯一性
  const existing = await prisma.post.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new Error(`Slug "${slug}" already exists`);
  }

  // 使用 transaction 確保文章、版本、標籤關聯一致性
  const post = await prisma.$transaction(async (tx) => {
    // 建立文章
    const created = await tx.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt ?? null,
        coverImage: coverImage ?? null,
        status,
        publishedAt: publishedAt ?? null,
        scheduledAt: scheduledAt ?? null,
        categoryId: categoryId ?? null,
        authorId,
      },
    });

    // 建立第一個版本
    await tx.postVersion.create({
      data: {
        postId: created.id,
        title,
        content,
        version: 1,
      },
    });

    // 建立標籤關聯
    if (tagIds && tagIds.length > 0) {
      await tx.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: created.id,
          tagId,
        })),
      });
    }

    return created;
  });

  return post;
}

/**
 * 更新文章
 * - 自動建立新版本（版本號遞增）
 * - 更新標籤關聯
 */
export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<Post> {
  // 檢查文章是否存在
  const existing = await prisma.post.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Post "${id}" not found`);
  }

  // 檢查 slug 唯一性（排除自己）
  if (input.slug !== undefined) {
    const slugExists = await prisma.post.findUnique({
      where: { slug: input.slug },
    });
    if (slugExists && slugExists.id !== id) {
      throw new Error(`Slug "${input.slug}" already exists`);
    }
  }

  const post = await prisma.$transaction(async (tx) => {
    // 更新文章
    const updated = await tx.post.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
    });

    // 建立新版本（當 title 或 content 有變更時）
    if (input.title !== undefined || input.content !== undefined) {
      // 取得目前最新版本號
      const latestVersion = await tx.postVersion.findFirst({
        where: { postId: id },
        orderBy: { version: 'desc' },
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      await tx.postVersion.create({
        data: {
          postId: id,
          title: input.title ?? existing.title,
          content: input.content ?? existing.content,
          version: nextVersion,
        },
      });
    }

    // 更新標籤關聯
    if (input.tagIds !== undefined) {
      // 先刪除舊關聯
      await tx.postTag.deleteMany({
        where: { postId: id },
      });

      // 建立新關聯
      if (input.tagIds.length > 0) {
        await tx.postTag.createMany({
          data: input.tagIds.map((tagId) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    return updated;
  });

  return post;
}

/**
 * 刪除文章
 * - Cascade 刪除版本和標籤關聯（已在 schema 設定）
 */
export async function deletePost(id: string): Promise<void> {
  const existing = await prisma.post.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Post "${id}" not found`);
  }

  await prisma.post.delete({
    where: { id },
  });
}

/**
 * 取得單篇文章（含關聯）
 */
export async function getPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * 取得文章列表（含分頁、篩選、搜尋）
 */
export async function getPosts(
  options?: GetPostsOptions
): Promise<{
  data: Post[];
  total: number;
}> {
  const {
    page = 1,
    limit = 20,
    status,
    categoryId,
    tagId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    authorId,
  } = options ?? {};

  // 建構查詢條件
  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (tagId) {
    where.tags = {
      some: { tagId },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

/**
 * 更新文章狀態
 * - 狀態機驗證
 * - PUBLISHED 時設定 publishedAt
 * - SCHEDULED 時驗證 scheduledAt > now
 */
export async function updatePostStatus(
  id: string,
  status: PostStatus,
  scheduledAt?: Date
): Promise<Post> {
  const existing = await prisma.post.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Post "${id}" not found`);
  }

  // 狀態機驗證
  const validTargets = VALID_TRANSITIONS[existing.status];
  if (!validTargets || !validTargets.includes(status)) {
    throw new Error(
      `Invalid status transition: ${existing.status} → ${status}`
    );
  }

  // SCHEDULED 時驗證 scheduledAt
  if (status === 'SCHEDULED') {
    if (!scheduledAt) {
      throw new Error('scheduledAt is required for SCHEDULED status');
    }
    if (scheduledAt <= new Date()) {
      throw new Error('scheduledAt must be in the future');
    }
  }

  // 建構更新資料
  const updateData: Record<string, unknown> = { status };

  if (status === 'PUBLISHED' && !existing.publishedAt) {
    updateData.publishedAt = new Date();
  }

  if (status === 'SCHEDULED') {
    updateData.scheduledAt = scheduledAt;
  }

  // 取消發佈時清除 publishedAt
  if (status === 'DRAFT' && existing.status === 'PUBLISHED') {
    updateData.publishedAt = null;
  }

  return prisma.post.update({
    where: { id },
    data: updateData,
  });
}

/**
 * 批次刪除文章
 * @param ids 文章 ID 陣列（最多 100 筆）
 * @returns 刪除數量
 */
export async function batchDeletePosts(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }
  if (ids.length > 100) {
    throw new Error('Batch operation limited to 100 items');
  }

  const result = await prisma.post.deleteMany({
    where: { id: { in: ids } },
  });

  return result.count;
}

/**
 * 批次發佈文章
 * @param ids 文章 ID 陣列（最多 100 筆）
 * @returns 更新數量
 */
export async function batchPublishPosts(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }
  if (ids.length > 100) {
    throw new Error('Batch operation limited to 100 items');
  }

  const result = await prisma.post.updateMany({
    where: {
      id: { in: ids },
      status: { in: ['DRAFT', 'SCHEDULED'] },
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * 批次下架文章
 * @param ids 文章 ID 陣列（最多 100 筆）
 * @returns 更新數量
 */
export async function batchArchivePosts(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }
  if (ids.length > 100) {
    throw new Error('Batch operation limited to 100 items');
  }

  const result = await prisma.post.updateMany({
    where: {
      id: { in: ids },
      status: { in: ['DRAFT', 'PUBLISHED', 'SCHEDULED'] },
    },
    data: {
      status: 'ARCHIVED',
    },
  });

  return result.count;
}
