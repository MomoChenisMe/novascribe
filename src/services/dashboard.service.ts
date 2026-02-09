/**
 * @file 儀表板 Service 層
 * @description 儀表板統計數據查詢與近期活動查詢
 *   - getDashboardStats：文章總數、各狀態數量、分類/標籤/媒體總數、近 7 天新增文章數
 *   - getRecentActivity：查詢近期活動（文章建立/更新/發佈、分類/標籤建立、媒體上傳）
 */

import { prisma } from '@/lib/prisma';

/** 儀表板統計數據 */
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalCategories: number;
  totalTags: number;
  totalMedia: number;
  recentPostsCount: number;
}

/** 近期活動 */
export interface Activity {
  id: string;
  type:
    | 'post_created'
    | 'post_updated'
    | 'post_published'
    | 'category_created'
    | 'tag_created'
    | 'media_uploaded';
  title: string;
  description: string;
  timestamp: Date;
}

/**
 * 取得儀表板統計數據
 * 使用 prisma.count() 以獲得最佳效能
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    recentPostsCount,
    totalCategories,
    totalTags,
    totalMedia,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.count({ where: { status: 'SCHEDULED' } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.media.count(),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalCategories,
    totalTags,
    totalMedia,
    recentPostsCount,
  };
}

/**
 * 取得近期活動（最新 N 筆）
 * 查詢最近 7 天的文章/分類/標籤/媒體建立/更新記錄，依時間降序排列
 */
export async function getRecentActivity(limit: number = 10): Promise<Activity[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [posts, categories, tags, media] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
      select: { id: true, title: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.category.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.tag.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.media.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true, filename: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  const activities: Activity[] = [];

  // 處理文章活動
  for (const post of posts) {
    const isUpdated = post.updatedAt.getTime() !== post.createdAt.getTime();

    // 建立/發佈活動
    if (post.status === 'PUBLISHED') {
      activities.push({
        id: `post-published-${post.id}`,
        type: 'post_published',
        title: post.title,
        description: `文章「${post.title}」已發佈`,
        timestamp: post.createdAt,
      });
    } else {
      activities.push({
        id: `post-created-${post.id}`,
        type: 'post_created',
        title: post.title,
        description: `建立了文章「${post.title}」`,
        timestamp: post.createdAt,
      });
    }

    // 如果有更新，增加更新活動
    if (isUpdated) {
      activities.push({
        id: `post-updated-${post.id}`,
        type: 'post_updated',
        title: post.title,
        description: `更新了文章「${post.title}」`,
        timestamp: post.updatedAt,
      });
    }
  }

  // 處理分類活動
  for (const category of categories) {
    activities.push({
      id: `category-created-${category.id}`,
      type: 'category_created',
      title: category.name,
      description: `建立了分類「${category.name}」`,
      timestamp: category.createdAt,
    });
  }

  // 處理標籤活動
  for (const tag of tags) {
    activities.push({
      id: `tag-created-${tag.id}`,
      type: 'tag_created',
      title: tag.name,
      description: `建立了標籤「${tag.name}」`,
      timestamp: tag.createdAt,
    });
  }

  // 處理媒體活動
  for (const m of media) {
    activities.push({
      id: `media-uploaded-${m.id}`,
      type: 'media_uploaded',
      title: m.filename,
      description: `上傳了媒體「${m.filename}」`,
      timestamp: m.createdAt,
    });
  }

  // 按時間降序排列並限制筆數
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return activities.slice(0, limit);
}
