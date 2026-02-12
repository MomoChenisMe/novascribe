'use client';

import React, { useEffect, useState } from 'react';
import { renderCommentMarkdown } from '@/lib/comment-markdown';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: {
    id: string;
    authorName: string;
    authorEmail: string;
    content: string;
    createdAt: Date;
    status: string;
    postId: string;
    parentId: string | null;
  };
  onReply?: (commentId: string) => void;
}

/**
 * 計算相對時間（如「3 天前」）
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '剛剛';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else {
    return `${diffDays} 天前`;
  }
}

/**
 * 取得作者名稱首字母（用於頭像）
 */
function getInitial(name: string): string {
  if (!name || name.trim().length === 0) {
    return '?';
  }
  return name.trim()[0].toUpperCase();
}

export default function CommentItem({ comment, onReply }: CommentItemProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    // 非同步渲染 Markdown
    renderCommentMarkdown(comment.content).then((html) => {
      setHtmlContent(html);
    });
  }, [comment.content]);

  const initial = getInitial(comment.authorName);
  const relativeTime = getRelativeTime(comment.createdAt);

  const handleReplyClick = () => {
    setShowReplyForm(true);
    if (onReply) {
      onReply(comment.id);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  const handleReplyCancel = () => {
    setShowReplyForm(false);
  };

  return (
    <div className="flex gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
      {/* 頭像 */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
        aria-label="作者頭像"
      >
        {initial}
      </div>

      {/* 內容區 */}
      <div className="flex-1 min-w-0">
        {/* 作者名稱與時間 */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {comment.authorName}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {relativeTime}
          </span>
        </div>

        {/* Markdown 內容 */}
        <div
          data-testid="comment-content"
          className="prose prose-sm dark:prose-invert max-w-none mb-2"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* 回覆按鈕或回覆表單 */}
        {!showReplyForm && (
          <button
            onClick={handleReplyClick}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            回覆
          </button>
        )}

        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              postId={comment.postId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={handleReplyCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
