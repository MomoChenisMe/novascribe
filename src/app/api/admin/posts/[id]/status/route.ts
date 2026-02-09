/**
 * @file 文章狀態切換 API Route Handler
 * @description 處理 /api/admin/posts/[id]/status 的 PATCH 請求
 *   - PATCH：切換文章狀態（含狀態機驗證）
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostStatusSchema } from '@/lib/validators';
import { updatePostStatus } from '@/services/post.service';
import { z } from 'zod';

const UpdateStatusSchema = z.object({
  status: PostStatusSchema,
  scheduledAt: z.string().datetime().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/posts/[id]/status
 */
export async function PATCH(request: Request, context: RouteContext) {
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
    const parsed = UpdateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { status, scheduledAt } = parsed.data;
    const post = await updatePostStatus(
      id,
      status as any,
      scheduledAt ? new Date(scheduledAt) : undefined
    );

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    if (
      message.includes('Invalid status transition') ||
      message.includes('scheduledAt') ||
      message.includes('Batch operation limited')
    ) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
