/**
 * @file 評論管理頁面示例
 * @description 展示如何使用 CommentBatchActions 和 CommentSingleActions 組件
 */

'use client';

import { useState, useEffect } from 'react';
import CommentBatchActions from '@/components/admin/CommentBatchActions';
import CommentSingleActions from '@/components/admin/CommentSingleActions';

interface Comment {
  id: string;
  content: string;
  author: string;
  status: string;
  createdAt: string;
}

export default function CommentsManagementExample() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入評論列表
  async function loadComments() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/comments');
      const data = await response.json();

      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('載入評論失敗:', error);
    } finally {
      setLoading(false);
    }
  }

  // 處理單則評論更新
  function handleCommentUpdate(commentId: string) {
    return (updatedComment: Comment | null) => {
      if (updatedComment === null) {
        // 評論已刪除
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        // 評論已更新
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updatedComment : c))
        );
      }
    };
  }

  useEffect(() => {
    loadComments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">評論管理</h1>

      {/* 方式 1：使用批次操作組件（包含表格和批次操作 UI） */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          批次操作模式（推薦）
        </h2>
        <CommentBatchActions comments={comments} onRefresh={loadComments} />
      </div>

      {/* 方式 2：自訂表格 + 單則操作組件 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          單則操作模式（自訂 UI）
        </h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-3 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.author}
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      comment.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : comment.status === 'SPAM'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {comment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <CommentSingleActions
                comment={comment}
                onUpdate={handleCommentUpdate(comment.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
