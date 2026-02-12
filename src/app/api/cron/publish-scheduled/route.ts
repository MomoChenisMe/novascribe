/**
 * @file 排程發佈 Cron Route Handler
 * @description GET /api/cron/publish-scheduled
 *   - 查詢 status=SCHEDULED AND scheduledAt <= NOW() 的文章
 *   - 批次更新為 status=PUBLISHED, publishedAt=NOW()
 *   - 使用 CRON_SECRET 環境變數進行認證
 *   - 回傳 { success: true, published: number }
 *
 * 由 Vercel Cron 或外部排程器每 5 分鐘呼叫一次
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/publish-scheduled
 * 認證：Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  // 驗證 cron secret
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();

    // 查詢到期的排程文章
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
    });

    // 無到期文章
    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        published: 0,
      });
    }

    // 批次更新為已發佈
    const postIds = scheduledPosts.map((post) => post.id);
    await prisma.post.updateMany({
      where: {
        id: { in: postIds },
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      published: scheduledPosts.length,
    });
  } catch (error) {
    console.error('排程發佈失敗:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
