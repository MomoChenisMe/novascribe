/**
 * @file 管理員回覆元件
 * @description 管理員回覆評論的 inline 表單元件
 *   - 點擊「回覆」按鈕展開表單
 *   - 提交回覆到 API
 *   - 成功後收合表單並顯示成功訊息
 *   - 失敗時顯示錯誤訊息
 */

'use client';

import { useState } from 'react';

interface AdminCommentReplyProps {
  /** 評論 ID */
  commentId: string;
  /** 回覆成功回調 */
  onReplySuccess?: (reply: unknown) => void;
}

export function AdminCommentReply({
  commentId,
  onReplySuccess,
}: AdminCommentReplyProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /** 展開表單 */
  const handleOpenForm = () => {
    setIsFormOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  /** 收合表單 */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setContent('');
    setError(null);
  };

  /** 提交回覆 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 驗證內容
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('請輸入回覆內容');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: trimmedContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '回覆失敗');
      }

      // 成功
      setSuccessMessage('回覆成功');
      setContent('');
      setIsFormOpen(false);

      // 3 秒後清除成功訊息
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // 呼叫回調
      if (onReplySuccess) {
        onReplySuccess(data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '回覆失敗';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      {/* 回覆按鈕 */}
      {!isFormOpen && (
        <button
          onClick={handleOpenForm}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          回覆
        </button>
      )}

      {/* 回覆表單 */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            placeholder="輸入回覆內容..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />

          {/* 錯誤訊息 */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* 按鈕組 */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? '送出中...' : '送出回覆'}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 成功訊息 */}
      {successMessage && (
        <p className="mt-2 text-sm text-green-600" role="status">
          {successMessage}
        </p>
      )}
    </div>
  );
}
