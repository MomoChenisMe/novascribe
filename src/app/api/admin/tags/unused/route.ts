/**
 * @file 標籤清理 API Route Handler
 * @description 處理 /api/admin/tags/unused 的 DELETE 請求
 *   - DELETE：刪除所有未使用的標籤（沒有文章關聯的標籤）
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteUnusedTags } from '@/services/tag.service';

/**
 * DELETE /api/admin/tags/unused
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const deletedCount = await deleteUnusedTags();

    return NextResponse.json({ success: true, deletedCount });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
