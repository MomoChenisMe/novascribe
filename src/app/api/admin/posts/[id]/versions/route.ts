/**
 * @file 文章版本列表 API Route Handler
 * @description 處理 /api/admin/posts/[id]/versions 的 GET 請求
 *   - GET：取得文章的版本列表（按 version 降序）
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVersions } from '@/services/version.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/posts/[id]/versions
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const versions = await getVersions(id);

    return NextResponse.json({ success: true, data: versions });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
