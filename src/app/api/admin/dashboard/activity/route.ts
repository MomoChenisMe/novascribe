/**
 * @file 儀表板近期活動 API Route Handler
 * @description 處理 /api/admin/dashboard/activity 的 GET 請求
 *   - GET：取得近期活動列表
 *   - Query: ?limit=10
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecentActivity } from '@/services/dashboard.service';

/**
 * GET /api/admin/dashboard/activity
 * @query limit - 回傳筆數（預設 10）
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : 10;

    const data = await getRecentActivity(limit);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
