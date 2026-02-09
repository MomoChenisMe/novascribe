/**
 * @file Sitemap 設定 API Route Handler
 * @description 處理 /api/admin/seo/sitemap-config 的 GET、PUT 請求
 *   - GET：取得所有 sitemap 設定
 *   - PUT：更新 sitemap 設定（upsert by path）
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VALID_CHANGEFREQ = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const;

const SitemapConfigSchema = z.object({
  path: z.string().min(1),
  changefreq: z.enum(VALID_CHANGEFREQ),
  priority: z.number().min(0).max(1),
  enabled: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/seo/sitemap-config
 * 取得所有 sitemap 設定
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
    const configs = await prisma.sitemapConfig.findMany();
    return NextResponse.json({ success: true, data: configs });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/seo/sitemap-config
 * 更新 sitemap 設定（upsert by path）
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
    const parsed = SitemapConfigSchema.safeParse(body);

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

    const { path, changefreq, priority, enabled } = parsed.data;

    const config = await prisma.sitemapConfig.upsert({
      where: { path },
      update: { changefreq, priority, enabled },
      create: { path, changefreq, priority, enabled },
    });

    return NextResponse.json({ success: true, data: config });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
