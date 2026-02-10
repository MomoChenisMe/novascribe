/**
 * @file 管理員評論 [id] API Route Handler
 * @description 處理 /api/admin/comments/[id] 的 PUT/DELETE 請求
 *   - PUT：更新評論狀態
 *   - DELETE：刪除評論
 *   - 需要認證
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateCommentStatus, deleteComment } from '@/lib/services/comment.service';
import { CommentStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/comments/[id]
 * 更新評論狀態
 * @param request - NextRequest
 * @param context - Route context（含 params）
 * @returns 更新後的評論
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 取得路由參數
    const { id } = await context.params;

    // 解析 request body
    const body = await request.json();
    const { status } = body;

    // 驗證 status 欄位
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // 驗證 status 值
    if (!Object.values(CommentStatus).includes(status as CommentStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // 呼叫 service 更新狀態
    const updatedComment = await updateCommentStatus(id, status as CommentStatus);

    // 若評論不存在，回傳 404
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/comments/[id]
 * 刪除評論
 * @param request - NextRequest
 * @param context - Route context（含 params）
 * @returns 刪除結果
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 取得路由參數
    const { id } = await context.params;

    // 呼叫 service 刪除評論
    const deleted = await deleteComment(id);

    // 若評論不存在，回傳 404
    if (!deleted) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/admin/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
