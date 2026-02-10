import prisma from '@/lib/prisma';

export interface PublicTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface GetTagBySlugOptions {
  page?: number;
  limit?: number;
}

export interface TagWithPostsResult {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
  posts: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 獲取公開標籤列表
 * 每個標籤包含已發布文章數量（僅計算 PUBLISHED 狀態）
 * 按文章數量降序排列
 */
export async function getPublicTags(): Promise<PublicTag[]> {
  const tags = await prisma.tag.findMany({
    orderBy: { posts: { _count: 'desc' } },
    include: {
      _count: {
        select: {
          posts: {
            where: { post: { status: 'PUBLISHED' } },
          },
        },
      },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag._count.posts,
  }));
}

/**
 * 透過 slug 取得標籤詳情及其關聯的已發布文章列表
 * 支援分頁
 * 文章按 publishedAt 降序排列
 */
export async function getTagBySlug(
  slug: string,
  options: GetTagBySlugOptions = {}
): Promise<TagWithPostsResult | null> {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // 取得標籤資訊
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    return null;
  }

  // 查詢含有該標籤的已發布文章與總數
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        tags: { some: { tagId: tag.id } },
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.post.count({
      where: {
        tags: { some: { tagId: tag.id } },
        status: 'PUBLISHED',
      },
    }),
  ]);

  return {
    tag: {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    },
    posts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
