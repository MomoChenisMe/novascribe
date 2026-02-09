/**
 * @file 文章 [id] API Route Handler
 * @description 處理 /api/admin/posts/[id] 的 GET、PUT、DELETE 請求
 *   - GET：取得單篇文章（含關聯）
 *   - PUT：更新文章
 *   - DELETE：刪除文章
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdatePostSchema } from '@/lib/validators';
import {
  getPostById,
  updatePost,
  deletePost,
} from '@/services/post.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/posts/[id]
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
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/posts/[id]
 */
export async function PUT(request: Request, context: RouteContext) {
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
    const parsed = UpdatePostSchema.safeParse(body);

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

    const post = await updatePost(id, parsed.data);

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    if (message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    await deletePost(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
