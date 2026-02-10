import prisma from '@/lib/prisma';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface GetCategoryBySlugOptions {
  page?: number;
  limit?: number;
}

export interface CategoryWithPostsResult {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  posts: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 獲取公開分類列表
 * 每個分類包含已發布文章數量（僅計算 PUBLISHED 狀態）
 * 按名稱字母序排列
 */
export async function getPublicCategories(): Promise<PublicCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          posts: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    postCount: cat._count.posts,
  }));
}

/**
 * 透過 slug 取得分類詳情及其下的已發布文章列表
 * 支援分頁
 * 文章按 publishedAt 降序排列
 */
export async function getCategoryBySlug(
  slug: string,
  options: GetCategoryBySlugOptions = {}
): Promise<CategoryWithPostsResult | null> {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // 取得分類資訊
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return null;
  }

  // 查詢該分類下的已發布文章與總數
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        categoryId: category.id,
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
        categoryId: category.id,
        status: 'PUBLISHED',
      },
    }),
  ]);

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    },
    posts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
