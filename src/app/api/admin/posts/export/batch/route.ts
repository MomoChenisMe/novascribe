/**
 * @file 文章批次匯出 API Route Handler
 * @description 處理 /api/admin/posts/export/batch 的 POST 請求
 *   - POST：批次匯出文章為 ZIP
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportPostsBatch } from '@/services/export.service';

/**
 * POST /api/admin/posts/export/batch
 * Body: { postIds: string[] }
 * Response: application/zip attachment
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { postIds } = body;

    if (!postIds || !Array.isArray(postIds)) {
      return NextResponse.json(
        { success: false, error: 'postIds must be an array of strings' },
        { status: 400 }
      );
    }

    const zipBuffer = await exportPostsBatch(postIds);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="posts.zip"',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
