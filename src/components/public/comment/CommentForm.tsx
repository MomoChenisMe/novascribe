'use client';

import React, { useState } from 'react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
}

interface FormData {
  authorName: string;
  authorEmail: string;
  content: string;
  honeypot: string;
}

interface FormErrors {
  authorName?: string;
  authorEmail?: string;
  content?: string;
}

export default function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    authorName: '',
    authorEmail: '',
    content: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 驗證表單欄位
   */
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.authorName.trim()) {
      newErrors.authorName = '請輸入姓名';
    }

    if (!formData.authorEmail.trim()) {
      newErrors.authorEmail = '請輸入電子郵件';
    } else {
      // 簡單的 Email 格式驗證
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.authorEmail)) {
        newErrors.authorEmail = '請輸入有效的電子郵件格式';
      }
    }

    if (!formData.content.trim()) {
      newErrors.content = '請輸入評論內容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * 處理表單送出
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 清除先前的訊息
    setSuccessMessage('');
    setErrorMessage('');

    // 驗證表單
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const body: Record<string, string> = {
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        content: formData.content,
        honeypot: formData.honeypot,
      };

      if (parentId) {
        body.parentId = parentId;
      }

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || '評論送出失敗');
        return;
      }

      // 成功：清空表單
      setFormData({
        authorName: '',
        authorEmail: '',
        content: '',
        honeypot: '',
      });
      setSuccessMessage('評論已送出，待審核後顯示');

      // 呼叫 onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage('評論送出失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * 處理欄位變更（清除對應錯誤訊息）
   */
  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤訊息
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 姓名欄位 */}
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          姓名 *
        </label>
        <input
          type="text"
          id="authorName"
          name="authorName"
          value={formData.authorName}
          onChange={(e) => handleChange('authorName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.authorName && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.authorName}</p>
        )}
      </div>

      {/* 電子郵件欄位 */}
      <div>
        <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          電子郵件 *
        </label>
        <input
          type="text"
          id="authorEmail"
          name="authorEmail"
          value={formData.authorEmail}
          onChange={(e) => handleChange('authorEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.authorEmail && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.authorEmail}</p>
        )}
      </div>

      {/* 評論內容欄位 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          評論內容 *
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.content && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.content}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          支援 Markdown 格式（粗體、斜體、程式碼、連結等）
        </p>
      </div>

      {/* Honeypot 欄位（隱藏，用於 anti-spam） */}
      <input
        type="text"
        name="website"
        value={formData.honeypot}
        onChange={(e) => setFormData((prev) => ({ ...prev, honeypot: e.target.value }))}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      {/* 回覆模式：隱藏 parentId */}
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      {/* 成功訊息 */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* 錯誤訊息 */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* 送出按鈕 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '送出中...' : '送出評論'}
      </button>
    </form>
  );
}
