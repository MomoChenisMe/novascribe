/**
 * @file MissingSeoList 元件
 * @description 顯示缺少 SEO 資料的文章清單
 *   - 清單渲染
 *   - 快速編輯連結
 *   - 全部完善時的訊息
 */

import React from 'react';

export interface MissingSeoPost {
  id: string;
  title: string;
  slug: string;
  hasTitle: boolean;
  hasDescription: boolean;
}

interface MissingSeoListProps {
  posts: MissingSeoPost[];
}

export function MissingSeoList({ posts }: MissingSeoListProps) {
  if (posts.length === 0) {
    return (
      <div
        className="text-center py-8 bg-green-50 rounded-lg"
        data-testid="all-complete"
      >
        <p className="text-green-600 font-medium">
          🎉 所有文章的 SEO 設定已完善！
        </p>
      </div>
    );
  }

  return (
    <div data-testid="missing-seo-list">
      <h3 className="text-lg font-semibold mb-3">
        缺少 SEO 資料的文章（{posts.length} 篇）
      </h3>
      <ul className="divide-y" data-testid="missing-seo-items">
        {posts.map((post) => (
          <li
            key={post.id}
            className="py-3 flex items-center justify-between"
            data-testid="missing-seo-item"
          >
            <div>
              <p className="font-medium">{post.title}</p>
              <div className="flex gap-2 text-xs mt-1">
                {!post.hasTitle && (
                  <span className="text-red-500" data-testid="missing-title">
                    缺少 Title
                  </span>
                )}
                {!post.hasDescription && (
                  <span
                    className="text-red-500"
                    data-testid="missing-description"
                  >
                    缺少 Description
                  </span>
                )}
              </div>
            </div>
            <a
              href={`/admin/posts/${post.id}/edit`}
              className="text-sm text-blue-600 hover:underline"
              data-testid="edit-link"
            >
              編輯 SEO
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
