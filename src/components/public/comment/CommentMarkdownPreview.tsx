'use client';

import { useState, useEffect } from 'react';
import { renderCommentMarkdown } from '@/lib/comment-markdown';

interface CommentMarkdownPreviewProps {
  content: string;
  onChange: (value: string) => void;
}

export default function CommentMarkdownPreview({
  content,
  onChange,
}: CommentMarkdownPreviewProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // 當切換到預覽模式或內容改變時，重新渲染 Markdown
  useEffect(() => {
    if (activeTab === 'preview') {
      renderCommentMarkdown(content || '').then(setRenderedHtml);
    }
  }, [activeTab, content]);

  return (
    <div className="w-full">
      {/* Tab 標籤 */}
      <div className="flex border-b border-gray-200 mb-4" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'edit'}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'edit'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('edit')}
        >
          編輯
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'preview'}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('preview')}
        >
          預覽
        </button>
      </div>

      {/* Tab 內容 */}
      <div role="tabpanel">
        {activeTab === 'edit' ? (
          <textarea
            className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            value={content || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="輸入您的評論（支援 Markdown 格式）"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none min-h-[200px] p-3 border border-gray-200 rounded-md bg-gray-50"
          >
            {renderedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            ) : (
              <p className="text-gray-400 italic">尚無內容</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
