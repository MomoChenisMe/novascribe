/**
 * @file /api/admin/comments/stats Route Handler
 * @description 評論統計資料 API
 *   - GET：取得評論統計資料（總數、待審核數、已批准數、垃圾評論數、已刪除數）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/comments/stats
 * 取得評論統計資料
 * @param request - NextRequest
 * @returns 統計資料
 */
export async function GET(request: NextRequest) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 平行查詢所有統計資料
    const [total, pending, approved, spam, deleted] = await Promise.all([
      prisma.comment.count({}),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'SPAM' } }),
      prisma.comment.count({ where: { status: 'DELETED' } }),
    ]);

    return NextResponse.json(
      {
        total,
        pending,
        approved,
        spam,
        deleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/comments/stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
