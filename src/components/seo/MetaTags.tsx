/**
 * @file MetaTags 元件
 * @description OG 和 Twitter Card meta tags 注入
 *   - 支援 Open Graph protocol tags
 *   - 支援 Twitter Card tags
 *   - 可選欄位僅在有值時渲染
 */

import React from 'react';

export interface MetaTagsProps {
  title: string;
  url: string;
  description?: string;
  image?: string;
  type?: string;
  siteName?: string;
  twitterCard?: string;
  twitterHandle?: string;
}

export function MetaTags({
  title,
  url,
  description,
  image,
  type = 'website',
  siteName,
  twitterCard = 'summary_large_image',
  twitterHandle,
}: MetaTagsProps) {
  return (
    <>
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {description && (
        <meta property="og:description" content={description} />
      )}
      {image && <meta property="og:image" content={image} />}
      {siteName && <meta property="og:site_name" content={siteName} />}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      {image && <meta name="twitter:image" content={image} />}
      {twitterHandle && (
        <meta name="twitter:site" content={twitterHandle} />
      )}
    </>
  );
}
