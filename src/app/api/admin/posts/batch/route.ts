/**
 * @file 文章批次操作 API Route Handler
 * @description 處理 /api/admin/posts/batch 的 POST 請求
 *   - POST：批次操作（刪除/發佈/下架）
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import {
  batchDeletePosts,
  batchPublishPosts,
  batchArchivePosts,
} from '@/services/post.service';

const BatchActionSchema = z.object({
  action: z.enum(['delete', 'publish', 'archive']),
  ids: z.array(z.string()).min(1),
});

/**
 * POST /api/admin/posts/batch
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
    const parsed = BatchActionSchema.safeParse(body);

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

    const { action, ids } = parsed.data;
    let count: number;

    switch (action) {
      case 'delete':
        count = await batchDeletePosts(ids);
        break;
      case 'publish':
        count = await batchPublishPosts(ids);
        break;
      case 'archive':
        count = await batchArchivePosts(ids);
        break;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Batch operation limited')) {
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
