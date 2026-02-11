import { prisma } from '@/lib/prisma';
import { CommentStatus } from '@prisma/client';

export interface CreateCommentInput {
  postId: string;
  parentId?: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface GetApprovedCommentsOptions {
  page?: number;
  limit?: number;
}

export interface ApprovedCommentsResult {
  comments: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Email 格式驗證（簡單 regex）
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 建立評論
 * - 檢查 Post 是否存在且 status = 'PUBLISHED'
 * - 若 parentId 存在，檢查 parent 是否存在
 * - 若 parent 也有 parentId（回覆的回覆），則將新評論的 parentId 設為 parent.parentId（歸入頂層）
 * - Email 格式驗證
 * - 預設 status = 'PENDING'
 */
export async function createComment(input: CreateCommentInput) {
  const { postId, parentId, authorName, authorEmail, content, ipAddress, userAgent } = input;

  // 欄位驗證
  if (!authorName || authorName.trim() === '') {
    throw new Error('作者名稱為必填');
  }

  if (!authorEmail || authorEmail.trim() === '') {
    throw new Error('Email 為必填');
  }

  if (!isValidEmail(authorEmail)) {
    throw new Error('Email 格式不正確');
  }

  if (!content || content.trim() === '') {
    throw new Error('評論內容為必填');
  }

  // 檢查 Post 是否存在且已發布
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post) {
    throw new Error('文章不存在');
  }

  if (post.status !== 'PUBLISHED') {
    throw new Error('無法在未發布的文章上留言');
  }

  // 處理 parentId（若有）
  let finalParentId = parentId || null;

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true, parentId: true },
    });

    if (!parentComment) {
      throw new Error('父評論不存在');
    }

    // 若 parent 也有 parentId（回覆的回覆），則歸入頂層
    if (parentComment.parentId) {
      finalParentId = parentComment.parentId;
    }
  }

  // 查詢自動核准設定
  const autoApproveSetting = await prisma.siteSetting.findUnique({
    where: { key: 'comment_auto_approve' },
  });

  // 決定初始狀態
  const status: CommentStatus =
    autoApproveSetting?.value === 'true' ? 'APPROVED' : 'PENDING';

  // 建立評論
  return prisma.comment.create({
    data: {
      postId,
      parentId: finalParentId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      content: content.trim(),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      status,
    },
  });
}

/**
 * 取得已核准的評論（公開 API）
 * - 先取頂層評論（parentId = null, status = 'APPROVED'），分頁
 * - 再一次查詢所有 replies（parentId IN 頂層 IDs, status = 'APPROVED'）
 * - 組合成巢狀結構回傳
 */
export async function getApprovedComments(
  postId: string,
  options: GetApprovedCommentsOptions = {}
): Promise<ApprovedCommentsResult> {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // 查詢頂層評論（已核准）
  const topLevelComments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      status: 'APPROVED',
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip,
  });

  // 計算總數
  const total = await prisma.comment.count({
    where: {
      postId,
      parentId: null,
      status: 'APPROVED',
    },
  });

  // 若沒有頂層評論，直接返回
  if (topLevelComments.length === 0) {
    return {
      comments: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // 查詢所有回覆（一次查詢）
  const topLevelIds = topLevelComments.map((c) => c.id);
  const replies = await prisma.comment.findMany({
    where: {
      parentId: { in: topLevelIds },
      status: 'APPROVED',
    },
    orderBy: { createdAt: 'asc' },
  });

  // 組合巢狀結構
  const commentsWithReplies = topLevelComments.map((comment) => ({
    ...comment,
    replies: replies.filter((r) => r.parentId === comment.id),
  }));

  return {
    comments: commentsWithReplies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 刪除評論
 * @param commentId 評論 ID
 * @param options 選項：{ hard?: boolean } 是否硬刪除
 * @returns 刪除後的評論
 */
export async function deleteComment(
  commentId: string,
  options?: { hard?: boolean }
) {
  // 檢查評論是否存在
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  // 硬刪除：實際刪除記錄（Prisma schema 已設定 onDelete: Cascade 自動處理 replies）
  if (options?.hard) {
    return await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // 軟刪除：設定 status 為 DELETED
  return await prisma.comment.update({
    where: { id: commentId },
    data: { status: 'DELETED' },
  });
}

/**
 * 建立管理員回覆
 * @param params 參數：{ commentId, content, adminUser: { id, name, email } }
 * @returns 建立的回覆
 */
export async function createAdminReply(params: {
  commentId: string;
  content: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
}) {
  const { commentId, content, adminUser } = params;

  // 檢查父評論是否存在
  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!parentComment) {
    throw new Error('Parent comment not found');
  }

  // 建立管理員回覆
  return await prisma.comment.create({
    data: {
      postId: parentComment.postId,
      parentId: commentId,
      authorName: adminUser.name,
      authorEmail: adminUser.email,
      content,
      status: 'APPROVED', // 管理員回覆自動核准
    },
  });
}

/**
 * 批次更新評論狀態
 * @param ids - 評論 ID 陣列（最多 50 則）
 * @param action - 操作類型：'approve' | 'spam' | 'delete'
 * @returns 更新數量
 */
export async function batchUpdateComments({
  ids,
  action,
}: {
  ids: string[];
  action: 'approve' | 'spam' | 'delete';
}) {
  // 驗證：最多 50 則
  if (ids.length > 50) {
    throw new Error('Cannot batch update more than 50 comments at once');
  }

  // 根據 action 決定 status
  let status: 'APPROVED' | 'SPAM' | 'DELETED';
  switch (action) {
    case 'approve':
      status = 'APPROVED';
      break;
    case 'spam':
      status = 'SPAM';
      break;
    case 'delete':
      status = 'DELETED';
      break;
  }

  // 批次更新
  const result = await prisma.comment.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return result;
}

/**
 * 取得評論統計資料
 * @returns 待審核數、今日新增數、已核准總數、Spam 總數
 */
export async function getCommentStats() {
  // 計算今日 00:00:00（UTC）
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // 並行查詢統計資料
  const [pending, todayNew, approved, spam] = await Promise.all([
    // 待審核數
    prisma.comment.count({
      where: { status: 'PENDING' },
    }),
    // 今日新增數
    prisma.comment.count({
      where: {
        createdAt: { gte: todayStart },
      },
    }),
    // 已核准總數
    prisma.comment.count({
      where: { status: 'APPROVED' },
    }),
    // Spam 總數
    prisma.comment.count({
      where: { status: 'SPAM' },
    }),
  ]);

  return {
    pending,
    todayNew,
    approved,
    spam,
  };
}

export interface GetAdminCommentsOptions {
  page?: number;
  limit?: number;
  status?: CommentStatus;
}

export interface AdminCommentsResult {
  comments: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 獲取後台評論列表（管理員用）
 * 支援狀態篩選、分頁
 */
export async function getAdminComments(
  options: GetAdminCommentsOptions = {}
): Promise<AdminCommentsResult> {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  // 建立查詢條件
  const where: any = {};

  if (status) {
    where.status = status;
  }

  // 查詢評論與總數
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 更新評論狀態（管理員用）
 * 若評論不存在，返回 null
 */
export async function updateCommentStatus(
  commentId: string,
  status: CommentStatus
): Promise<any | null> {
  // 先檢查評論是否存在
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    return null;
  }

  // 更新狀態
  return prisma.comment.update({
    where: { id: commentId },
    data: { status },
  });
}
