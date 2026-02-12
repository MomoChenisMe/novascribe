/**
 * @file Email HTML 模板
 * @description 提供 Email 通知的 HTML 模板（使用 table layout 確保郵件客戶端相容性）
 */

interface Comment {
  id: string;
  authorName: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
}

/**
 * 截斷文字至指定長度
 * @param text 原始文字
 * @param maxLength 最大長度
 * @returns 截斷後的文字
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * 新評論通知 Email 模板
 * @param comment 評論資料
 * @param post 文章資料
 * @param adminUrl 管理後台連結
 * @returns HTML 內容
 */
export function newCommentTemplate(
  comment: Comment,
  post: Post,
  adminUrl: string
): string {
  const contentPreview = truncateText(comment.content, 200);

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新評論通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Microsoft JhengHei', sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4a90e2; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">NovaScribe 新評論通知</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px; font-size: 16px; color: #333333;">
                <strong>${comment.authorName}</strong> 在文章「<strong>${post.title}</strong>」發表了新評論：
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-left: 4px solid #4a90e2; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                      ${contentPreview}
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #4a90e2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px;">
                      前往管理後台審核
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                這是一封系統自動發送的通知信件，請勿直接回覆。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 回覆通知 Email 模板
 * @param reply 回覆資料
 * @param parentComment 原評論資料
 * @param post 文章資料
 * @returns HTML 內容
 */
export function replyTemplate(
  reply: Comment,
  parentComment: Comment,
  post: Post
): string {
  const replyContentPreview = truncateText(reply.content, 200);
  const parentContentPreview = truncateText(parentComment.content, 200);

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>回覆通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Microsoft JhengHei', sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4a90e2; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">NovaScribe 回覆通知</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px; font-size: 16px; color: #333333;">
                <strong>${reply.authorName}</strong> 回覆了您在文章「<strong>${post.title}</strong>」的評論：
              </p>
              
              <!-- Original Comment -->
              <p style="margin: 20px 0 10px; font-size: 14px; color: #666666;">
                <strong>您的評論：</strong>
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-left: 4px solid #cccccc; margin: 0 0 20px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                      ${parentContentPreview}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Reply -->
              <p style="margin: 20px 0 10px; font-size: 14px; color: #666666;">
                <strong>回覆內容：</strong>
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e8f4fd; border-left: 4px solid #4a90e2; margin: 0 0 30px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                      ${replyContentPreview}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                這是一封系統自動發送的通知信件，請勿直接回覆。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
