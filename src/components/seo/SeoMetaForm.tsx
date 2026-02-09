'use client';

/**
 * @file SEO Meta 編輯表單元件
 * @description 提供 SEO meta 資料的編輯表單，包含：
 *   - Meta title / description
 *   - OG title / description / image
 *   - Canonical URL
 *   - noIndex / noFollow
 *   - Focus keyword
 *   - Twitter Card 類型選擇
 *   - 即時字元數計數器
 */

import { useState, useCallback } from 'react';

/** SEO Meta 資料型別 */
export interface SeoMetaData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  noFollow?: boolean;
  focusKeyword?: string | null;
}

/** SeoMetaForm 元件 props */
export interface SeoMetaFormProps {
  /** 初始資料 */
  initialData?: SeoMetaData | null;
  /** 送出回呼 */
  onSubmit: (data: SeoMetaData) => Promise<void>;
  /** 是否載入中 */
  loading?: boolean;
  /** 驗證錯誤 */
  errors?: Record<string, string>;
}

/** 欄位字元限制 */
const LIMITS = {
  metaTitle: 70,
  metaDescription: 160,
  ogTitle: 95,
  ogDescription: 200,
  focusKeyword: 100,
};

export function SeoMetaForm({
  initialData,
  onSubmit,
  loading = false,
  errors: externalErrors,
}: SeoMetaFormProps) {
  const [formData, setFormData] = useState<SeoMetaData>({
    metaTitle: initialData?.metaTitle ?? '',
    metaDescription: initialData?.metaDescription ?? '',
    ogTitle: initialData?.ogTitle ?? '',
    ogDescription: initialData?.ogDescription ?? '',
    ogImage: initialData?.ogImage ?? '',
    twitterCard: initialData?.twitterCard ?? 'summary_large_image',
    canonicalUrl: initialData?.canonicalUrl ?? '',
    noIndex: initialData?.noIndex ?? false,
    noFollow: initialData?.noFollow ?? false,
    focusKeyword: initialData?.focusKeyword ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: keyof SeoMetaData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // 清除該欄位的錯誤
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      formData.metaTitle &&
      (formData.metaTitle as string).length > LIMITS.metaTitle
    ) {
      newErrors.metaTitle = `Meta title 不得超過 ${LIMITS.metaTitle} 字元`;
    }

    if (
      formData.metaDescription &&
      (formData.metaDescription as string).length > LIMITS.metaDescription
    ) {
      newErrors.metaDescription = `Meta description 不得超過 ${LIMITS.metaDescription} 字元`;
    }

    if (
      formData.ogTitle &&
      (formData.ogTitle as string).length > LIMITS.ogTitle
    ) {
      newErrors.ogTitle = `OG title 不得超過 ${LIMITS.ogTitle} 字元`;
    }

    if (
      formData.ogDescription &&
      (formData.ogDescription as string).length > LIMITS.ogDescription
    ) {
      newErrors.ogDescription = `OG description 不得超過 ${LIMITS.ogDescription} 字元`;
    }

    if (formData.canonicalUrl && formData.canonicalUrl) {
      try {
        new URL(formData.canonicalUrl as string);
      } catch {
        newErrors.canonicalUrl = 'Canonical URL 必須為有效 URL';
      }
    }

    if (formData.ogImage && formData.ogImage) {
      try {
        new URL(formData.ogImage as string);
      } catch {
        newErrors.ogImage = 'OG image URL 必須為有效 URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      await onSubmit(formData);
    },
    [formData, onSubmit, validate]
  );

  const displayErrors = { ...errors, ...externalErrors };

  return (
    <form onSubmit={handleSubmit} aria-label="SEO 設定表單">
      {/* Focus Keyword */}
      <div className="mb-4">
        <label
          htmlFor="focusKeyword"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Focus Keyword
        </label>
        <input
          id="focusKeyword"
          type="text"
          value={(formData.focusKeyword as string) || ''}
          onChange={(e) => handleChange('focusKeyword', e.target.value)}
          maxLength={LIMITS.focusKeyword}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="輸入焦點關鍵字"
        />
        <span className="text-xs text-gray-500">
          {((formData.focusKeyword as string) || '').length}/
          {LIMITS.focusKeyword}
        </span>
      </div>

      {/* Meta Title */}
      <div className="mb-4">
        <label
          htmlFor="metaTitle"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Meta Title
        </label>
        <input
          id="metaTitle"
          type="text"
          value={(formData.metaTitle as string) || ''}
          onChange={(e) => handleChange('metaTitle', e.target.value)}
          maxLength={LIMITS.metaTitle}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="輸入 meta title"
        />
        <span className="text-xs text-gray-500">
          {((formData.metaTitle as string) || '').length}/{LIMITS.metaTitle}
        </span>
        {displayErrors.metaTitle && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.metaTitle}
          </p>
        )}
      </div>

      {/* Meta Description */}
      <div className="mb-4">
        <label
          htmlFor="metaDescription"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          value={(formData.metaDescription as string) || ''}
          onChange={(e) => handleChange('metaDescription', e.target.value)}
          maxLength={LIMITS.metaDescription}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="輸入 meta description"
        />
        <span className="text-xs text-gray-500">
          {((formData.metaDescription as string) || '').length}/
          {LIMITS.metaDescription}
        </span>
        {displayErrors.metaDescription && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.metaDescription}
          </p>
        )}
      </div>

      {/* OG Title */}
      <div className="mb-4">
        <label
          htmlFor="ogTitle"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          OG Title
        </label>
        <input
          id="ogTitle"
          type="text"
          value={(formData.ogTitle as string) || ''}
          onChange={(e) => handleChange('ogTitle', e.target.value)}
          maxLength={LIMITS.ogTitle}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="輸入 Open Graph 標題"
        />
        <span className="text-xs text-gray-500">
          {((formData.ogTitle as string) || '').length}/{LIMITS.ogTitle}
        </span>
        {displayErrors.ogTitle && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.ogTitle}
          </p>
        )}
      </div>

      {/* OG Description */}
      <div className="mb-4">
        <label
          htmlFor="ogDescription"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          OG Description
        </label>
        <textarea
          id="ogDescription"
          value={(formData.ogDescription as string) || ''}
          onChange={(e) => handleChange('ogDescription', e.target.value)}
          maxLength={LIMITS.ogDescription}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="輸入 Open Graph 描述"
        />
        <span className="text-xs text-gray-500">
          {((formData.ogDescription as string) || '').length}/
          {LIMITS.ogDescription}
        </span>
        {displayErrors.ogDescription && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.ogDescription}
          </p>
        )}
      </div>

      {/* OG Image */}
      <div className="mb-4">
        <label
          htmlFor="ogImage"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          OG Image URL
        </label>
        <input
          id="ogImage"
          type="text"
          value={(formData.ogImage as string) || ''}
          onChange={(e) => handleChange('ogImage', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="https://example.com/image.jpg"
        />
        {displayErrors.ogImage && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.ogImage}
          </p>
        )}
      </div>

      {/* Twitter Card */}
      <div className="mb-4">
        <label
          htmlFor="twitterCard"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Twitter Card 類型
        </label>
        <select
          id="twitterCard"
          value={formData.twitterCard || 'summary_large_image'}
          onChange={(e) => handleChange('twitterCard', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="summary">Summary</option>
          <option value="summary_large_image">Summary Large Image</option>
          <option value="app">App</option>
          <option value="player">Player</option>
        </select>
      </div>

      {/* Canonical URL */}
      <div className="mb-4">
        <label
          htmlFor="canonicalUrl"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Canonical URL
        </label>
        <input
          id="canonicalUrl"
          type="text"
          value={(formData.canonicalUrl as string) || ''}
          onChange={(e) => handleChange('canonicalUrl', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="https://example.com/original-post"
        />
        {displayErrors.canonicalUrl && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {displayErrors.canonicalUrl}
          </p>
        )}
      </div>

      {/* noIndex / noFollow */}
      <div className="mb-4 flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.noIndex ?? false}
            onChange={(e) => handleChange('noIndex', e.target.checked)}
          />
          <span className="text-sm text-gray-700">noIndex</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.noFollow ?? false}
            onChange={(e) => handleChange('noFollow', e.target.checked)}
          />
          <span className="text-sm text-gray-700">noFollow</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '儲存中...' : '儲存 SEO 設定'}
      </button>
    </form>
  );
}
