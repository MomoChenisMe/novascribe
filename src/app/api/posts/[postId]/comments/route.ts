/**
 * 公開評論 API
 * POST /api/posts/[postId]/comments - 提交評論
 * GET /api/posts/[postId]/comments - 查詢已核准評論
 */

import { NextRequest, NextResponse } from 'next/server';
import { createComment, getApprovedComments } from '@/lib/services/comment.service';
import { checkAntiSpam } from '@/lib/anti-spam';
import { sendNewCommentNotification } from '@/lib/email';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    postId: string;
  };
}

/**
 * POST /api/posts/[postId]/comments
 * 提交評論
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = context.params;

    // 解析 request body
    const body = await request.json();
    const { authorName, authorEmail, content, parentId, honeypot } = body;

    // 基本欄位驗證
    if (!authorName || typeof authorName !== 'string' || authorName.trim() === '') {
      return NextResponse.json(
        { error: '作者名稱為必填' },
        { status: 400 }
      );
    }

    if (!authorEmail || typeof authorEmail !== 'string' || authorEmail.trim() === '') {
      return NextResponse.json(
        { error: 'Email 為必填' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: '評論內容為必填' },
        { status: 400 }
      );
    }

    // 取得 IP 地址
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';

    // Anti-spam 檢查
    const antiSpamResult = checkAntiSpam({
      content,
      honeypot,
      ipAddress,
    });

    if (!antiSpamResult.pass) {
      // Rate limit 回傳 429
      if (antiSpamResult.reason === 'rate_limit') {
        return NextResponse.json(
          { error: '請稍後再試' },
          { status: 429 }
        );
      }

      // 其他 anti-spam 失敗回傳 400
      return NextResponse.json(
        { error: '評論未通過驗證' },
        { status: 400 }
      );
    }

    // 取得 User-Agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // 建立評論
    try {
      const comment = await createComment({
        postId,
        parentId: parentId || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        content: content.trim(),
        ipAddress,
        userAgent,
      });

      // 非同步發送通知（不阻塞回應）
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (post) {
        sendNewCommentNotification(comment, post).catch((error) => {
          console.error('Failed to send comment notification:', error);
        });
      }

      return NextResponse.json(comment, { status: 201 });
    } catch (error: any) {
      // 處理 service 層的錯誤
      const errorMessage = error.message || '建立評論失敗';

      // 文章不存在或未發布 -> 404
      if (
        errorMessage.includes('文章不存在') ||
        errorMessage.includes('未發布')
      ) {
        return NextResponse.json(
          { error: errorMessage },
          { status: 404 }
        );
      }

      // 其他驗證錯誤 -> 400
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[postId]/comments
 * 查詢已核准評論
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = context.params;

    // 從 query string 取得分頁參數
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '10', 10);

    // 參數驗證與修正
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // 限制最大每頁數量
    if (limit > 100) {
      limit = 100;
    }

    // 查詢已核准評論
    const result = await getApprovedComments(postId, {
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '取得評論失敗' },
      { status: 500 }
    );
  }
}
