/**
 * @file 分類 API Route Handler
 * @description 處理 /api/admin/categories 的 GET 和 POST 請求
 *   - GET：取得分類列表（?tree=true 回傳樹狀結構）
 *   - POST：建立新分類
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateCategorySchema } from '@/lib/validators';
import {
  createCategory,
  getCategories,
  getCategoryTree,
} from '@/services/category.service';

/**
 * GET /api/admin/categories
 * @query tree=true 回傳樹狀結構
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const isTree = searchParams.get('tree') === 'true';

    const data = isTree ? await getCategoryTree() : await getCategories();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
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
    const parsed = CreateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const category = await createCategory(parsed.data);

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }

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
