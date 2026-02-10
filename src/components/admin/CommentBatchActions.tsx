'use client';

/**
 * @file CommentBatchActions 組件
 * @description 評論批次操作 UI（checkbox 勾選、批次按鈕、確認對話框、操作結果提示）
 */

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  content: string;
  author: string;
  status: string;
  createdAt: string;
}

interface CommentBatchActionsProps {
  comments: Comment[];
  onRefresh: () => void;
}

type BatchAction = 'approve' | 'spam' | 'delete' | null;

export default function CommentBatchActions({
  comments,
  onRefresh,
}: CommentBatchActionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [batchAction, setBatchAction] = useState<BatchAction>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 全選/取消全選
  function handleSelectAll() {
    if (selectedIds.size === comments.length && comments.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  }

  // 單筆選取/取消
  function handleSelectOne(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  // 開啟確認對話框
  function openConfirmDialog(action: BatchAction) {
    setBatchAction(action);
    setShowConfirmDialog(true);
  }

  // 關閉確認對話框
  function closeConfirmDialog() {
    setShowConfirmDialog(false);
    setBatchAction(null);
  }

  // 執行批次操作
  async function handleConfirm() {
    if (!batchAction || selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/admin/comments/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: batchAction,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 成功
        const actionLabels: Record<string, string> = {
          approve: '核准',
          spam: '標記為 Spam',
          delete: '刪除',
        };

        // 格式：成功核准 2 則評論 / 成功標記 2 則評論為 Spam / 成功刪除 2 則評論
        let successText = '';
        if (batchAction === 'spam') {
          successText = `成功標記 ${data.updated} 則評論為 Spam`;
        } else {
          successText = `成功${actionLabels[batchAction]} ${data.updated} 則評論`;
        }

        setMessage({
          type: 'success',
          text: successText,
        });

        // 清除勾選
        setSelectedIds(new Set());

        // 重新載入列表
        onRefresh();
      } else {
        // 失敗 - 顯示 error 欄位內容
        const errorMessage = data.error || '操作失敗';
        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '操作失敗',
      });
    } finally {
      closeConfirmDialog();
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

  const actionLabels: Record<string, string> = {
    approve: '核准',
    spam: '標記為 Spam',
    delete: '刪除',
  };

  return (
    <div>
      {/* 訊息提示 */}
      {message && (
        <div
          className={`mb-4 rounded-md px-4 py-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 批次操作列 */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-md bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-700">
            已選取 {selectedIds.size} 筆
          </span>
          <button
            onClick={() => openConfirmDialog('approve')}
            className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
          >
            批次核准
          </button>
          <button
            onClick={() => openConfirmDialog('spam')}
            className="rounded-md bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
          >
            批次標記 Spam
          </button>
          <button
            onClick={() => openConfirmDialog('delete')}
            className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
          >
            批次刪除
          </button>
        </div>
      )}

      {/* 評論表格 */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="全選"
                  checked={
                    selectedIds.size === comments.length && comments.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                內容
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                作者
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                狀態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                日期
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`選取 ${comment.content}`}
                    checked={selectedIds.has(comment.id)}
                    onChange={() => handleSelectOne(comment.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {comment.content.substring(0, 50)}
                  {comment.content.length > 50 ? '...' : ''}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {comment.author}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {comment.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('zh-TW')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 確認對話框 */}
      {showConfirmDialog && batchAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              批次操作確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要批次{actionLabels[batchAction]}已選取的 {selectedIds.size}{' '}
              則評論嗎？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
