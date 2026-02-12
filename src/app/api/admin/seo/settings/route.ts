/**
 * @file SEO 設定 API Route Handler
 * @description 處理 /api/admin/seo/settings 的 GET、PUT 請求
 *   - GET：取得全站 SEO 設定
 *   - PUT：更新全站 SEO 設定（批量 upsert）
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** 支援的 SEO 設定鍵名 */
const SEO_SETTING_KEYS = [
  'seo.default_title',
  'seo.default_description',
  'seo.og_image',
  'seo.twitter_handle',
  'seo.robots_custom_rules',
  'seo.ga4_id',
  'seo.gsc_verification',
] as const;

/**
 * GET /api/admin/seo/settings
 * 取得全站 SEO 設定
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
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [...SEO_SETTING_KEYS] } },
    });

    // 建立鍵值對映射，不存在的鍵回傳 null
    const result: Record<string, string | null> = {};
    for (const key of SEO_SETTING_KEYS) {
      const setting = settings.find((s) => s.key === key);
      result[key] = setting?.value ?? null;
    }

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/seo/settings
 * 更新全站 SEO 設定（批量 upsert）
 */
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // 過濾並更新設定（只接受 seo.* 開頭的鍵）
    const updates = Object.entries(body).filter(([key]) =>
      key.startsWith('seo.')
    );

    for (const [key, value] of updates) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
