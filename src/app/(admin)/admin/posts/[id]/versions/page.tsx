'use client';

/**
 * @file 版本歷史頁面
 * @description 後台文章版本歷史管理
 *   - 載入版本列表（GET /api/admin/posts/[id]/versions）
 *   - 時間線樣式顯示版本
 *   - 點擊版本展開內容預覽
 *   - 回溯按鈕 → 確認 modal → POST /api/admin/posts/[id]/versions/[versionId]/restore
 *   - 回溯成功導回編輯頁
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Version {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt: string;
  versionNumber: number;
  createdAt: string;
}

export default function PostVersionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 回溯確認 modal
  const [restoreTarget, setRestoreTarget] = useState<Version | null>(null);
  const [restoring, setRestoring] = useState(false);

  /** 載入版本列表 */
  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/posts/${id}/versions`);
      const json = await res.json();

      if (json.success) {
        setVersions(json.data);
      } else {
        setError('載入失敗');
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  /** 切換版本展開/收合 */
  function toggleExpand(versionId: string) {
    setExpandedId((prev) => (prev === versionId ? null : versionId));
  }

  /** 回溯版本 */
  async function handleRestore() {
    if (!restoreTarget) return;

    setRestoring(true);

    try {
      const res = await fetch(
        `/api/admin/posts/${id}/versions/${restoreTarget.id}/restore`,
        { method: 'POST' }
      );

      const json = await res.json();

      if (json.success) {
        router.push(`/admin/posts/${id}/edit`);
      }
    } catch {
      // 靜默處理
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  }

  /** 格式化時間 */
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 載入中
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  // 錯誤
  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-red-700">載入失敗</p>
        </div>
        <button
          onClick={() => router.push(`/admin/posts/${id}/edit`)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          返回編輯
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">版本歷史</h1>
        <button
          type="button"
          onClick={() => router.push(`/admin/posts/${id}/edit`)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          返回編輯
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-8 text-center">
          <p className="text-gray-500">尚無版本記錄</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* 版本標頭 */}
              <button
                type="button"
                onClick={() => toggleExpand(version.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {version.versionNumber}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      版本 {version.versionNumber} — {version.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(version.createdAt)}
                    </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedId === version.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 展開內容 */}
              {expandedId === version.id && (
                <div className="border-t border-gray-200 px-6 py-4">
                  {version.excerpt && (
                    <div className="mb-4">
                      <h4 className="mb-1 text-sm font-medium text-gray-700">
                        摘要
                      </h4>
                      <p className="text-sm text-gray-600">{version.excerpt}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="mb-1 text-sm font-medium text-gray-700">
                      內容
                    </h4>
                    <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
                      {version.content}
                    </pre>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRestoreTarget(version)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      回溯到此版本
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 回溯確認 Modal */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">回溯確認</h2>
            <p className="mt-2 text-gray-600">
              確定要回溯到此版本嗎？（版本 {restoreTarget.versionNumber}：
              {restoreTarget.title}）
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                確定回溯
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
