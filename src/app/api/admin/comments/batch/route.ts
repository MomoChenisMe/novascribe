/**
 * @file 管理員批次操作評論 API Route Handler
 * @description 處理 /api/admin/comments/batch 的 PUT 請求
 *   - PUT：批次更新評論狀態（核准/spam/刪除）
 *   - 需要認證
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { batchUpdateComments } from '@/lib/services/comment.service';

/**
 * PUT /api/admin/comments/batch
 * 批次更新評論狀態
 * @param request - NextRequest
 * @returns { updated: number }
 */
export async function PUT(request: NextRequest) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 解析 request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { ids, action } = body;

    // 驗證必填參數
    if (!ids || !action) {
      return NextResponse.json(
        { error: 'ids and action are required' },
        { status: 400 }
      );
    }

    // 驗證 ids 是否為陣列
    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'ids must be an array' },
        { status: 400 }
      );
    }

    // 驗證 action 類型
    const validActions = ['approve', 'spam', 'delete'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: approve, spam, delete' },
        { status: 400 }
      );
    }

    // 呼叫 service 進行批次更新
    const result = await batchUpdateComments({ ids, action });

    return NextResponse.json({ updated: result.count }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin/comments/batch error:', error);

    // 檢查是否為超過上限錯誤
    if (error instanceof Error && error.message.includes('more than 50 comments')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
