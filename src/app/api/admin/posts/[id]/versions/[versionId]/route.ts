/**
 * @file 文章版本詳情 API Route Handler
 * @description 處理 /api/admin/posts/[id]/versions/[versionId] 的 GET 請求
 *   - GET：取得特定版本的內容
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVersionById } from '@/services/version.service';

interface RouteContext {
  params: Promise<{ id: string; versionId: string }>;
}

/**
 * GET /api/admin/posts/[id]/versions/[versionId]
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
    const { id, versionId } = await context.params;
    const version = await getVersionById(id, versionId);

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: version });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
