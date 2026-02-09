/**
 * @file SEO Score API Route Handler
 * @description 處理 /api/admin/seo/score/[postId] 的 GET 請求
 *   - GET：計算並回傳文章 SEO 評分（總分與各項目明細）
 *   - 需要認證
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSeoScore } from '@/lib/seo/score';

interface RouteContext {
  params: Promise<{ postId: string }>;
}

/**
 * GET /api/admin/seo/score/[postId]
 * 計算並回傳文章 SEO 評分
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

    // 取得文章
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // 取得 SEO 設定
    const seoMetadata = await prisma.seoMetadata.findUnique({
      where: { postId },
    });

    // 計算評分
    const scoreResult = calculateSeoScore({
      metaTitle: seoMetadata?.metaTitle ?? null,
      metaDescription: seoMetadata?.metaDescription ?? null,
      focusKeyword: seoMetadata?.focusKeyword ?? null,
      ogImage: seoMetadata?.ogImage ?? null,
      content: post.content,
      title: post.title,
    });

    return NextResponse.json({
      success: true,
      data: scoreResult,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
