/**
 * @file 管理員評論 API Route Handler
 * @description 處理 /api/admin/comments 的 GET 請求
 *   - GET：取得評論列表（支援狀態篩選、分頁）
 *   - 需要認證
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminComments } from '@/lib/services/comment.service';
import { CommentStatus } from '@prisma/client';

/**
 * GET /api/admin/comments
 * 取得管理員評論列表
 * @param request - NextRequest
 * @returns 評論列表（含分頁資訊）
 */
export async function GET(request: NextRequest) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 取得查詢參數
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // 解析參數
    const page = parseInt(pageParam || '1', 10) || 1;
    const limit = parseInt(limitParam || '20', 10) || 20;

    // 建立 options 物件
    const options: {
      page: number;
      limit: number;
      status?: CommentStatus;
    } = {
      page,
      limit,
    };

    // 處理 status 篩選
    if (statusParam && Object.values(CommentStatus).includes(statusParam as CommentStatus)) {
      options.status = statusParam as CommentStatus;
    }

    // 呼叫 service
    const result = await getAdminComments(options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
