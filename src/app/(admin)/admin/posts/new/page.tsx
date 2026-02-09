'use client';

/**
 * @file 新增文章頁面
 * @description 後台新增文章表單
 *   - 標題（必填）、Slug（自動生成，可手動編輯）
 *   - 內容（MarkdownEditor）
 *   - 摘要（選填）
 *   - 封面圖片（選填）
 *   - 狀態（DRAFT/PUBLISHED/SCHEDULED/ARCHIVED）
 *   - 排程時間（SCHEDULED 時顯示）
 *   - 分類（下拉）
 *   - 標籤（多選）
 *   - 儲存 + 取消
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

/** 簡易 slug 生成：英文小寫 + 空白轉連字號 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewPostPage() {
  const router = useRouter();

  // 表單欄位
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
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

  /** 載入分類和標籤 */
  const loadData = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags?limit=100'),
      ]);

      const catJson = await catRes.json();
      const tagJson = await tagRes.json();

      if (catJson.success) setCategories(catJson.data);
      if (tagJson.success) setTags(tagJson.data);
    } catch {
      // 靜默處理
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** 標題變更 → 自動生成 Slug */
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(generateSlug(value));
    }
  }

  /** Slug 手動編輯 */
  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
  }

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

  /** 提交表單 */
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
      if (status === 'PUBLISHED') {
        body.publishedAt = new Date().toISOString();
      }

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">新增文章</h1>
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
            onChange={(e) => handleTitleChange(e.target.value)}
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
            onChange={(e) => handleSlugChange(e.target.value)}
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
    </div>
  );
}
