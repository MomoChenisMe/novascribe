/**
 * @file 文章匯入 API Route Handler
 * @description 處理 /api/admin/posts/import 的 POST 請求
 *   - POST：從 Markdown 檔案匯入文章
 *   - 需要認證
 *   - Body: multipart/form-data with `file` field
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importPost } from '@/services/import.service';

/**
 * POST /api/admin/posts/import
 * Body: multipart/form-data with `file` field (.md 檔案)
 * Response: { success: true, data: Post }
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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'file field is required' },
        { status: 400 }
      );
    }

    const markdown = await file.text();
    const userId = (session.user as { id: string }).id;

    const post = await importPost(markdown, userId);

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
