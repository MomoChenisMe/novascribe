/**
 * @file 分類 [id] API Route Handler
 * @description 處理 /api/admin/categories/[id] 的 PUT 和 DELETE 請求
 *   - PUT：更新分類
 *   - DELETE：刪除分類
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateCategorySchema } from '@/lib/validators';
import {
  updateCategory,
  deleteCategory,
} from '@/services/category.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/categories/[id]
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
    const parsed = UpdateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, parsed.data);

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    if (message.includes('already exists') || message.includes('Circular reference') || message.includes('cannot be its own parent')) {
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
 * DELETE /api/admin/categories/[id]
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
    await deleteCategory(id);

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
