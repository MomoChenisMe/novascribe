/**
 * @file 媒體 API Route Handler
 * @description 處理 /api/admin/media 的 GET 和 POST 請求
 *   - GET：取得媒體列表（分頁）
 *   - POST：上傳媒體（multipart/form-data）
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadMedia, getMediaList } from '@/services/media.service';
import {
  parsePaginationParams,
  createPaginatedResponse,
} from '@/lib/pagination';

/**
 * GET /api/admin/media
 * @query page - 頁碼（預設 1）
 * @query limit - 每頁筆數（預設 20）
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
    const params = parsePaginationParams(searchParams);

    const { data, total } = await getMediaList({
      page: params.page,
      limit: params.limit,
    });

    const response = createPaginatedResponse(data, total, params);

    return NextResponse.json({ success: true, ...response });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/media
 * Body: multipart/form-data with `file` field
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const media = await uploadMedia({
      buffer,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (
      message.includes('Unsupported image format') ||
      message.includes('File size exceeds limit') ||
      message.includes('No file provided')
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
