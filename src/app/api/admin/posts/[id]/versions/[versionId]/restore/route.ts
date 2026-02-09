/**
 * @file 版本回溯 API Route Handler
 * @description 處理 /api/admin/posts/[id]/versions/[versionId]/restore 的 POST 請求
 *   - POST：回溯到指定版本（更新文章內容，建立新版本）
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { restoreVersion } from '@/services/version.service';

interface RouteContext {
  params: Promise<{ id: string; versionId: string }>;
}

/**
 * POST /api/admin/posts/[id]/versions/[versionId]/restore
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id, versionId } = await context.params;
    const post = await restoreVersion(id, versionId);

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error instanceof Error && error.message === 'Version not found') {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
