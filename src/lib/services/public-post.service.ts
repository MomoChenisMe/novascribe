import prisma from '@/lib/prisma';

export interface GetPublishedPostsOptions {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
}

export interface PublishedPostsResult {
  posts: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 獲取已發布的文章列表（公開 API）
 * 支援分頁、分類篩選、標籤篩選
 */
export async function getPublishedPosts(
  options: GetPublishedPostsOptions = {}
): Promise<PublishedPostsResult> {
  const { page = 1, limit = 10, categorySlug, tagSlug } = options;
  const skip = (page - 1) * limit;

  // 建立查詢條件
  const where: any = {
    status: 'PUBLISHED',
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  // 查詢文章與總數
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip,
      include: {
        category: true,
        tags: { include: { tag: true } },
        seoMetadata: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 依 slug 獲取單篇文章（公開 API）
 * 只返回已發布的文章
 */
export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      seoMetadata: true,
    },
  });
}

/**
 * 獲取相關文章（同分類）
 * 排除目前文章本身
 */
export async function getRelatedPosts(postId: string, limit: number = 5) {
  // 先取得目前文章的分類
  const currentPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { categoryId: true },
  });

  if (!currentPost || !currentPost.categoryId) {
    return [];
  }

  // 查詢同分類的其他文章
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: currentPost.categoryId,
      id: { not: postId },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      category: true,
    },
  });
}
