/**
 * @file ArticleJsonLd 元件
 * @description 文章結構化資料（Schema.org BlogPosting）
 *   - 輸出 JSON-LD script tag
 *   - 可選欄位（image、dateModified、description）僅在有值時輸出
 */

import React from 'react';

export interface ArticleJsonLdProps {
  title: string;
  url: string;
  datePublished: string;
  authorName: string;
  description?: string;
  dateModified?: string;
  image?: string;
}

export function ArticleJsonLd({
  title,
  url,
  datePublished,
  authorName,
  description,
  dateModified,
  image,
}: ArticleJsonLdProps) {
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    url,
    datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: authorName,
    },
  };

  if (description) {
    structuredData.description = description;
  }

  if (dateModified) {
    structuredData.dateModified = dateModified;
  }

  if (image) {
    structuredData.image = image;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
