'use client';

/**
 * @file 媒體管理頁面
 * @description 後台媒體管理，支援圖片網格顯示、拖放上傳、刪除確認、分頁。
 *   - 圖片網格顯示（縮圖）
 *   - 上傳區域（拖放或點擊選擇）
 *   - 每張圖片顯示：縮圖、檔名、大小、上傳時間、刪除按鈕
 *   - 刪除確認 modal
 *   - 分頁控制
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/** 媒體資料 */
interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  uploadedBy: string;
  createdAt: string;
}

/** 分頁元資料 */
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 格式化檔案大小 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // 上傳狀態
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 刪除確認狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);

  /** 載入媒體列表 */
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setMediaList(json.data);
        setMeta(json.meta);
      } else {
        setError(json.error || '載入失敗');
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  /** 上傳檔案 */
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        if (!json.success) {
          setError(json.error || '上傳失敗');
          return;
        }
      }

      await loadMedia();
    } catch {
      setError('上傳失敗');
    } finally {
      setUploading(false);
      // 清除 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  /** 處理拖放 */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  /** 開啟刪除確認 */
  function handleDelete(media: MediaItem) {
    setDeletingMedia(media);
    setShowDeleteConfirm(true);
  }

  /** 確認刪除 */
  async function handleConfirmDelete() {
    if (!deletingMedia) return;

    try {
      const res = await fetch(`/api/admin/media/${deletingMedia.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || '刪除失敗');
      }

      setShowDeleteConfirm(false);
      setDeletingMedia(null);
      await loadMedia();
    } catch {
      setError('刪除失敗');
    }
  }

  // 載入中
  if (loading && mediaList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  // 錯誤
  if (error && mediaList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <h1 className="text-2xl font-bold text-gray-900">媒體管理</h1>

      {/* 錯誤提示 */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 上傳區域 */}
      <div
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-500">
          {uploading ? '上傳中...' : '拖放圖片至此，或點擊選擇檔案'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          支援 JPEG、PNG、WebP、GIF，最大 10MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          data-testid="file-input"
        />
      </div>

      {/* 圖片網格 */}
      {mediaList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">尚無媒體</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mediaList.map((media) => (
            <div
              key={media.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* 縮圖 */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={media.thumbnailUrl ?? media.url}
                  alt={media.filename}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* 資訊 */}
              <div className="p-2">
                <p
                  className="truncate text-xs font-medium text-gray-700"
                  title={media.filename}
                >
                  {media.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(media.size)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(media.createdAt)}
                </p>
              </div>

              {/* 刪除按鈕 */}
              <button
                onClick={() => handleDelete(media)}
                className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="刪除"
              >
                刪除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 分頁控制 */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共 {meta.total} 筆，第 {meta.page}/{meta.totalPages} 頁
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!meta.hasPrev}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNext}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && deletingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              刪除確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要刪除「{deletingMedia.filename}」嗎？此操作無法復原。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingMedia(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
