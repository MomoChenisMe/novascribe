/**
 * @file 文章 API Route Handler
 * @description 處理 /api/admin/posts 的 GET 和 POST 請求
 *   - GET：取得文章列表（分頁、篩選、搜尋、排序）
 *   - POST：建立新文章
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreatePostSchema } from '@/lib/validators';
import { parsePaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { createPost, getPosts } from '@/services/post.service';

/**
 * GET /api/admin/posts
 * @query page, limit, status, categoryId, tagId, search, sortBy, sortOrder
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

    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortByRaw = searchParams.get('sortBy');
    const sortBy = (['publishedAt', 'updatedAt', 'createdAt'].includes(sortByRaw!)
      ? sortByRaw
      : 'createdAt') as 'publishedAt' | 'updatedAt' | 'createdAt';
    const sortOrder =
      searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const { data, total } = await getPosts({
      page,
      limit,
      status: status as any,
      categoryId,
      tagId,
      search,
      sortBy,
      sortOrder,
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
 * POST /api/admin/posts
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
    const parsed = CreatePostSchema.safeParse(body);

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

    const { publishedAt, scheduledAt, tagIds, ...rest } = parsed.data;
    const userId = (session.user as Record<string, unknown>).id as string;

    const post = await createPost({
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      tagIds,
      authorId: userId,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
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
