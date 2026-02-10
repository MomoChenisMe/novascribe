'use client';

/**
 * @file CommentSingleActions 組件
 * @description 單則評論操作 UI（核准、標記 Spam、刪除按鈕、狀態即時更新）
 */

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  content: string;
  author: string;
  status: string;
  createdAt: string;
}

interface CommentSingleActionsProps {
  comment: Comment;
  onUpdate: (updatedComment: Comment | null) => void;
}

export default function CommentSingleActions({
  comment,
  onUpdate,
}: CommentSingleActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 核准評論
  async function handleApprove() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '已核准' });
        onUpdate(data);
      } else {
        setMessage({ type: 'error', text: '操作失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失敗' });
    } finally {
      setLoading(false);
    }
  }

  // 標記為 Spam
  async function handleSpam() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SPAM' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '已標記為 Spam' });
        onUpdate(data);
      } else {
        setMessage({ type: 'error', text: '操作失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失敗' });
    } finally {
      setLoading(false);
    }
  }

  // 刪除評論
  async function handleDelete() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '已刪除' });
        onUpdate(null);
      } else {
        setMessage({ type: 'error', text: '操作失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失敗' });
    } finally {
      setLoading(false);
    }
  }

  // 自動清除訊息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-2">
      {/* 訊息提示 */}
      {message && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex space-x-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          核准
        </button>
        <button
          onClick={handleSpam}
          disabled={loading}
          className="rounded-md bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Spam
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          刪除
        </button>
      </div>
    </div>
  );
}
