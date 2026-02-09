'use client';

/**
 * @file Markdown 編輯器元件
 * @description 支援即時預覽的 Markdown 編輯器
 *   - 工具列：粗體、斜體、標題、清單、連結
 *   - 編輯/預覽切換
 *   - 基本 Markdown 渲染（標題、粗體、斜體、清單、連結、程式碼區塊）
 */

import { useState } from 'react';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

/** 工具列按鈕定義 */
const TOOLBAR_ITEMS = [
  { title: '粗體', icon: 'B', syntax: '**粗體文字**' },
  { title: '斜體', icon: 'I', syntax: '*斜體文字*' },
  { title: '標題', icon: 'H', syntax: '## 標題' },
  { title: '清單', icon: '☰', syntax: '- 項目' },
  { title: '連結', icon: '🔗', syntax: '[連結文字](https://)' },
];

/**
 * 簡易 Markdown → HTML 渲染
 * 支援：標題 (h1-h3)、粗體、斜體、清單、連結、程式碼區塊、段落
 */
function renderMarkdown(md: string): string {
  if (!md.trim()) return '';

  let html = md
    // 程式碼區塊
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行內程式碼
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 標題
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗體
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜體
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 連結
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 無序清單
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 換行
    .replace(/\n/g, '<br/>');

  // 用 <ul> 包裹 <li>
  html = html.replace(/((<li>.*?<\/li>(<br\/>)?)+)/g, '<ul>$1</ul>');

  return html;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = '500px',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  /** 插入工具列語法 */
  function handleToolbarClick(syntax: string) {
    onChange(value + syntax);
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-300">
      {/* 工具列 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-1">
        <div className="flex space-x-1">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => handleToolbarClick(item.syntax)}
              className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`rounded px-3 py-1 text-sm ${
              mode === 'edit'
                ? 'bg-white font-medium text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            編輯
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`rounded px-3 py-1 text-sm ${
              mode === 'preview'
                ? 'bg-white font-medium text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            預覽
          </button>
        </div>
      </div>

      {/* 編輯/預覽區域 */}
      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none border-none px-4 py-3 font-mono text-sm focus:outline-none"
          style={{ height }}
        />
      ) : (
        <div
          data-testid="markdown-preview"
          className="prose prose-sm max-w-none overflow-auto px-4 py-3"
          style={{ minHeight: height }}
        >
          {value.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
          ) : (
            <p className="text-gray-400">尚無內容</p>
          )}
        </div>
      )}
    </div>
  );
}
