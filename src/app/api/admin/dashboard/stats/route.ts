/**
 * @file 儀表板統計 API Route Handler
 * @description 處理 /api/admin/dashboard/stats 的 GET 請求
 *   - GET：取得儀表板統計數據
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardStats } from '@/services/dashboard.service';

/**
 * GET /api/admin/dashboard/stats
 * 回傳儀表板統計數據
 */
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await getDashboardStats();

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
