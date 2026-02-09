/**
 * @file SEO Meta API Route Handler
 * @description 處理 /api/admin/seo/posts/[postId] 的 GET、PUT 請求
 *   - GET：取得文章 SEO 設定
 *   - PUT：建立/更新文章 SEO 設定（upsert），同時計算 SEO 評分
 *   - 所有操作需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SeoMetadataSchema } from '@/lib/seo/validation';
import { calculateSeoScore } from '@/lib/seo/score';

interface RouteContext {
  params: Promise<{ postId: string }>;
}

/**
 * GET /api/admin/seo/posts/[postId]
 * 取得文章 SEO 設定
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { postId } = await context.params;

    // 檢查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const seoMetadata = await prisma.seoMetadata.findUnique({
      where: { postId },
    });

    return NextResponse.json({ success: true, data: seoMetadata });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/seo/posts/[postId]
 * 建立/更新文章 SEO 設定（upsert）
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
    const { postId } = await context.params;

    // 檢查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = SeoMetadataSchema.safeParse(body);

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

    // 計算 SEO 評分
    const scoreResult = calculateSeoScore({
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      focusKeyword: parsed.data.focusKeyword,
      ogImage: parsed.data.ogImage,
      content: post.content,
      title: post.title,
    });

    const seoMetadata = await prisma.seoMetadata.upsert({
      where: { postId },
      update: {
        ...parsed.data,
        seoScore: scoreResult.totalScore,
      },
      create: {
        postId,
        ...parsed.data,
        seoScore: scoreResult.totalScore,
      },
    });

    return NextResponse.json({ success: true, data: seoMetadata });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
