/**
 * @file SEO 儀表板 API Route Handler
 * @description GET /api/admin/seo/dashboard
 *   - 概覽數據（平均評分、完整 SEO 文章數、缺少 meta 文章數）
 *   - 缺少 SEO 清單
 *   - 改善建議
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBulkSuggestions, type PostSeoData } from '@/lib/seo/suggestions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 取得所有已發佈文章及其 SEO 設定
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        seoMetadata: {
          select: {
            metaTitle: true,
            metaDescription: true,
            ogImage: true,
            focusKeyword: true,
            seoScore: true,
          },
        },
      },
    });

    // 計算統計數據
    const totalPosts = posts.length;
    const postsWithScore = posts.filter(
      (p) => p.seoMetadata?.seoScore != null
    );
    const averageScore =
      postsWithScore.length > 0
        ? Math.round(
            postsWithScore.reduce(
              (sum, p) => sum + (p.seoMetadata?.seoScore ?? 0),
              0
            ) / postsWithScore.length
          )
        : 0;

    const completeSeoCount = postsWithScore.filter(
      (p) => (p.seoMetadata?.seoScore ?? 0) >= 80
    ).length;

    const missingMetaPosts = posts.filter(
      (p) =>
        !p.seoMetadata?.metaTitle || !p.seoMetadata?.metaDescription
    );

    // 產生改善建議
    const postSeoData: PostSeoData[] = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      metaTitle: p.seoMetadata?.metaTitle,
      metaDescription: p.seoMetadata?.metaDescription,
      ogImage: p.seoMetadata?.ogImage,
      focusKeyword: p.seoMetadata?.focusKeyword,
      seoScore: p.seoMetadata?.seoScore,
    }));

    const suggestions = generateBulkSuggestions(postSeoData);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPosts,
          averageScore,
          completeSeoCount,
          missingMetaCount: missingMetaPosts.length,
        },
        missingMetaPosts: missingMetaPosts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          hasTitle: !!p.seoMetadata?.metaTitle,
          hasDescription: !!p.seoMetadata?.metaDescription,
        })),
        suggestions: suggestions.slice(0, 20), // 最多回傳 20 條建議
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
