/**
 * @file 標籤 API Route Handler
 * @description 處理 /api/admin/tags 的 GET 和 POST 請求
 *   - GET：取得標籤列表（含使用次數、搜尋、排序、分頁）
 *   - POST：建立新標籤
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateTagSchema } from '@/lib/validators';
import { parsePaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { createTag, getTags } from '@/services/tag.service';

/**
 * GET /api/admin/tags
 * @query search - 搜尋標籤名稱
 * @query sortBy - 排序欄位：name | postCount
 * @query sortOrder - 排序方向：asc | desc
 * @query page - 頁碼
 * @query limit - 每頁筆數
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
    const { page, limit } = parsePaginationParams(searchParams);

    const search = searchParams.get('search') || undefined;
    const sortBy =
      searchParams.get('sortBy') === 'postCount' ? 'postCount' : 'name';
    const sortOrder =
      searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    const { data, total } = await getTags({
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    const response = createPaginatedResponse(data, total, { page, limit });

    return NextResponse.json({ success: true, ...response });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tags
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
    const parsed = CreateTagSchema.safeParse(body);

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

    const tag = await createTag(parsed.data);

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

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
