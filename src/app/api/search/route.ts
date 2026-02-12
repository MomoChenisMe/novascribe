import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PER_PAGE = 10;

/**
 * 高亮搜尋關鍵字
 */
function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * GET /api/search
 * 搜尋已發佈文章（標題、內容、摘要）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    // 驗證搜尋關鍵字
    if (!query) {
      return NextResponse.json(
        { error: '搜尋關鍵字為必填' },
        { status: 400 }
      );
    }

    // 搜尋條件
    const where = {
      status: 'PUBLISHED' as const,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // 查詢總數
    const total = await prisma.post.count({ where });

    // 查詢文章
    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // 高亮關鍵字
    const results = posts.map((post) => ({
      id: post.id,
      title: highlightText(post.title, query),
      slug: post.slug,
      excerpt: highlightText(post.excerpt || '', query),
      publishedAt: post.publishedAt,
      category: post.category,
      tags: post.tags.map((t) => t.tag),
    }));

    // 分頁資訊
    const totalPages = Math.ceil(total / PER_PAGE);

    return NextResponse.json({
      results,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: PER_PAGE,
      },
    });
  } catch (error) {
    console.error('搜尋錯誤:', error);
    return NextResponse.json(
      { error: '搜尋失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
