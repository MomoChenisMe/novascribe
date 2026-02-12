/**
 * @file /api/admin/comments/[id]/reply Route Handler
 * @description 處理管理員回覆評論 API
 *   - POST：管理員回覆評論（自動 APPROVED，觸發通知）
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminReply } from '@/lib/services/comment.service';
import { sendReplyNotification } from '@/lib/email';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/comments/[id]/reply
 * 管理員回覆評論
 */
export async function POST(request: Request, context: RouteContext) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    // 驗證 content
    const { content } = body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // 建立管理員回覆
    const reply = await createAdminReply({
      commentId: id,
      content: content.trim(),
      adminUser: {
        id: session.user.id as string,
        name: session.user.name as string,
        email: session.user.email as string,
      },
    });

    // 非同步發送回覆通知（不阻塞回應）
    sendReplyNotification(reply).catch((error) => {
      // 記錄錯誤但不影響回應
      console.error('Failed to send reply notification:', error);
    });

    // 成功回傳 201
    return NextResponse.json(
      { success: true, data: reply },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // 404 處理
    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    // 其他錯誤回傳 500
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
