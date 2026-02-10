/**
 * @file 評論列表表格元件
 * @description 顯示評論列表：作者、內容（前 50 字）、文章標題、狀態、時間、操作按鈕
 */

import Link from 'next/link';

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

interface CommentsTableProps {
  comments: Comment[];
}

/** 狀態顯示映射 */
const STATUS_LABELS: Record<string, string> = {
  PENDING: '待審核',
  APPROVED: '已核准',
  SPAM: 'Spam',
  DELETED: '已刪除',
};

/** 狀態顏色映射 */
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SPAM: 'bg-red-100 text-red-800',
  DELETED: 'bg-gray-100 text-gray-800',
};

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 截斷內容（前 50 字）
 */
function truncateContent(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
}

export default function CommentsTable({ comments }: CommentsTableProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">尚無評論</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                作者
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                內容
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                文章標題
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                狀態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                時間
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {comment.authorName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {comment.authorEmail}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {truncateContent(comment.content)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <Link
                    href={`/admin/posts/${comment.postId}/edit`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      STATUS_COLORS[comment.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[comment.status] || comment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end space-x-2">
                    {comment.status === 'PENDING' && (
                      <>
                        <button className="text-sm text-green-600 hover:text-green-800">
                          核准
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-800">
                          標記 Spam
                        </button>
                      </>
                    )}
                    {comment.status === 'APPROVED' && (
                      <button className="text-sm text-yellow-600 hover:text-yellow-800">
                        取消核准
                      </button>
                    )}
                    {comment.status === 'SPAM' && (
                      <button className="text-sm text-green-600 hover:text-green-800">
                        取消 Spam
                      </button>
                    )}
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
