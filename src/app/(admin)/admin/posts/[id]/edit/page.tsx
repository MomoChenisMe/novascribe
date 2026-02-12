'use client';

/**
 * @file 編輯文章頁面
 * @description 後台編輯文章表單
 *   - 載入文章資料（GET /api/admin/posts/[id]）
 *   - 預填表單欄位（title/slug/content/excerpt/status/category/tags）
 *   - 更新提交（PUT /api/admin/posts/[id]）
 *   - 刪除按鈕（確認 modal → DELETE API）
 *   - 版本歷史按鈕（導向 /admin/posts/[id]/versions）
 *   - 載入失敗顯示錯誤訊息
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 表單欄位
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [scheduledAt, setScheduledAt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // 下拉資料
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 刪除確認 modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** 載入文章資料、分類與標籤 */
  const loadData = useCallback(async () => {
    try {
      const [postRes, catRes, tagRes] = await Promise.all([
        fetch(`/api/admin/posts/${id}`),
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags?limit=100'),
      ]);

      const postJson = await postRes.json();
      const catJson = await catRes.json();
      const tagJson = await tagRes.json();

      if (!postJson.success) {
        setError('載入失敗');
        setLoading(false);
        return;
      }

      const post = postJson.data;

      // 預填表單
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setContent(post.content || '');
      setExcerpt(post.excerpt || '');
      setCoverImage(post.coverImage || '');
      setStatus(post.status || 'DRAFT');
      setCategoryId(post.categoryId || '');

      // 預填標籤
      if (post.tags && Array.isArray(post.tags)) {
        const tagIdSet = new Set<string>(
          post.tags.map((t: { tag: { id: string } }) => t.tag.id)
        );
        setSelectedTagIds(tagIdSet);
      }

      if (catJson.success) setCategories(catJson.data);
      if (tagJson.success) setTags(tagJson.data);

      setLoading(false);
    } catch {
      setError('載入失敗');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** 切換標籤選取 */
  function toggleTag(tagId: string) {
    const newSet = new Set(selectedTagIds);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  }

  /** 提交更新 */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        status,
      };

      if (excerpt.trim()) body.excerpt = excerpt.trim();
      if (coverImage.trim()) body.coverImage = coverImage.trim();
      if (categoryId) body.categoryId = categoryId;
      if (selectedTagIds.size > 0) body.tagIds = Array.from(selectedTagIds);
      if (status === 'SCHEDULED' && scheduledAt) {
        body.scheduledAt = new Date(scheduledAt).toISOString();
      }

      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        router.push('/admin/posts');
      }
    } catch {
      // 靜默處理
    } finally {
      setSubmitting(false);
    }
  }

  /** 刪除文章 */
  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (json.success) {
        router.push('/admin/posts');
      }
    } catch {
      // 靜默處理
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
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
          onClick={() => router.push('/admin/posts')}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          返回文章列表
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">編輯文章</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/posts/${id}/versions`)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            版本歷史
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            刪除
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 標題 */}
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-gray-700">
            標題
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="post-slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            id="post-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* 內容（Markdown 編輯器） */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            內容
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="撰寫文章內容..."
          />
        </div>

        {/* 摘要 */}
        <div>
          <label htmlFor="post-excerpt" className="block text-sm font-medium text-gray-700">
            摘要
          </label>
          <textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 封面圖片 */}
        <div>
          <label htmlFor="post-cover" className="block text-sm font-medium text-gray-700">
            封面圖片
          </label>
          <input
            id="post-cover"
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="輸入圖片 URL"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 狀態與排程 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-status" className="block text-sm font-medium text-gray-700">
              狀態
            </label>
            <select
              id="post-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已發佈</option>
              <option value="SCHEDULED">排程中</option>
              <option value="ARCHIVED">已封存</option>
            </select>
          </div>

          {status === 'SCHEDULED' && (
            <div>
              <label htmlFor="post-scheduled" className="block text-sm font-medium text-gray-700">
                排程時間
              </label>
              <input
                id="post-scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 分類 */}
        <div>
          <label htmlFor="post-category" className="block text-sm font-medium text-gray-700">
            分類
          </label>
          <select
            id="post-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">無分類</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 標籤 */}
        <div>
          <span className="block text-sm font-medium text-gray-700">標籤</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedTagIds.has(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-400">尚無標籤</p>
            )}
          </div>
        </div>

        {/* 按鈕列 */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            儲存
          </button>
        </div>
      </form>

      {/* 刪除確認 Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">刪除確認</h2>
            <p className="mt-2 text-gray-600">
              確定要刪除此文章嗎？此操作無法復原。
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
