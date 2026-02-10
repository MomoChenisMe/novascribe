/**
 * Email 模組
 * 負責發送各類通知郵件
 */

import nodemailer from 'nodemailer'
import type { Comment, Post } from '@prisma/client'

/**
 * 初始化 SMTP transporter
 * 若環境變數未完整設定，返回 null（停用郵件功能）
 */
const transporter =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null

/**
 * 獲取 transporter 實例（用於測試）
 */
export function getTransporter() {
  return transporter
}

/**
 * 發送新評論通知郵件給管理員
 *
 * @param comment - 評論資料
 * @param post - 文章資料
 */
export async function sendNewCommentNotification(
  comment: Comment,
  post: Post
): Promise<void> {
  // 若 transporter 未初始化，直接返回（停用通知）
  if (!transporter) {
    return
  }

  // 若評論狀態為 SPAM，不發送通知
  if (comment.status === 'SPAM') {
    return
  }

  // 若檢測到 honeypot 欄位有值，不發送通知
  if (comment.website) {
    return
  }

  // 若 ADMIN_EMAIL 未設定，不發送郵件
  if (!process.env.ADMIN_EMAIL) {
    return
  }

  // 構建郵件內容
  const subject = `[NovaScribe] 新評論待審核：${post.title}`
  const html = generateCommentNotificationHTML(comment, post)

  // 發送郵件
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  })
}

/**
 * 生成評論通知郵件的 HTML 內容
 */
function generateCommentNotificationHTML(
  comment: Comment,
  post: Post
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h2 {
      margin: 0;
      color: #2563eb;
    }
    .content {
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .field {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #111827;
    }
    .comment-content {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>📬 新評論待審核</h2>
  </div>

  <div class="content">
    <div class="field">
      <div class="field-label">文章標題</div>
      <div class="field-value">${escapeHtml(post.title)}</div>
    </div>

    <div class="field">
      <div class="field-label">評論作者</div>
      <div class="field-value">${escapeHtml(comment.author)}</div>
    </div>

    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value">${escapeHtml(comment.email)}</div>
    </div>

    <div class="field">
      <div class="field-label">評論內容</div>
      <div class="comment-content">${escapeHtml(comment.content)}</div>
    </div>

    <div class="field">
      <div class="field-label">發表時間</div>
      <div class="field-value">${comment.createdAt.toLocaleString('zh-TW')}</div>
    </div>
  </div>

  <div class="footer">
    <p>這是一封自動發送的通知郵件，請勿直接回覆。</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * HTML 轉義（防止 XSS）
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * 發送回覆通知郵件給原評論作者
 *
 * @param reply - 回覆評論資料
 */
export async function sendReplyNotification(reply: Comment): Promise<void> {
  // 若 transporter 未初始化，直接返回（停用通知）
  if (!transporter) {
    return
  }

  // 查詢父評論和文章資料
  const prismaClient = await import('@/lib/prisma').then((m) => m.default)
  
  const parentComment = await prismaClient.comment.findUnique({
    where: { id: reply.parentId as string },
    include: {
      post: true,
    },
  })

  if (!parentComment || !parentComment.post) {
    return
  }

  // 若父評論沒有 email，無法發送通知
  if (!parentComment.email) {
    return
  }

  // 構建郵件內容
  const subject = `[NovaScribe] ${reply.authorName} 回覆了您的評論`
  const html = generateReplyNotificationHTML(reply, parentComment, parentComment.post)

  // 發送郵件
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: parentComment.email,
    subject,
    html,
  })
}

/**
 * 生成回覆通知郵件的 HTML 內容
 */
function generateReplyNotificationHTML(
  reply: Comment,
  parentComment: Comment,
  post: Post
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h2 {
      margin: 0;
      color: #2563eb;
    }
    .content {
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .field {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #111827;
    }
    .comment-content {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
      margin-top: 10px;
    }
    .reply-content {
      background-color: #e8f4fd;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #10b981;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>💬 收到新回覆</h2>
  </div>

  <div class="content">
    <div class="field">
      <div class="field-label">文章標題</div>
      <div class="field-value">${escapeHtml(post.title)}</div>
    </div>

    <div class="field">
      <div class="field-label">您的評論</div>
      <div class="comment-content">${escapeHtml(parentComment.content)}</div>
    </div>

    <div class="field">
      <div class="field-label">${escapeHtml(reply.authorName)} 的回覆</div>
      <div class="reply-content">${escapeHtml(reply.content)}</div>
    </div>

    <div class="field">
      <div class="field-label">回覆時間</div>
      <div class="field-value">${reply.createdAt.toLocaleString('zh-TW')}</div>
    </div>
  </div>

  <div class="footer">
    <p>這是一封自動發送的通知郵件，請勿直接回覆。</p>
  </div>
</body>
</html>
  `.trim()
}
