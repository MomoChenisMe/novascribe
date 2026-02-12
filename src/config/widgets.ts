export type WidgetType = 'rich-text' | 'image-grid' | 'link-list';

export interface RichTextWidgetConfig {
  type: 'rich-text';
  label: string;
  icon?: string;
  content: string; // Markdown or plain text
}

export interface ImageGridWidgetConfig {
  type: 'image-grid';
  label: string;
  icon?: string;
  images: {
    src: string;
    alt: string;
    href?: string;
  }[];
}

export interface LinkListWidgetConfig {
  type: 'link-list';
  label: string;
  icon?: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

export type WidgetConfig =
  | RichTextWidgetConfig
  | ImageGridWidgetConfig
  | LinkListWidgetConfig;

/**
 * Footer Widget 靜態設定
 * 未來可改為從 API 或 CMS 動態取得
 */
export const footerWidgets: WidgetConfig[] = [
  {
    type: 'rich-text',
    label: 'Disclaimer',
    content: `## Disclaimer

本站所有文章內容僅代表個人觀點，不構成任何專業建議。

所有程式碼範例僅供參考，使用前請自行評估風險。

© ${new Date().getFullYear()} NovaScribe. All rights reserved.`,
  },
  {
    type: 'image-grid',
    label: 'Certifications',
    images: [
      { src: '/images/certs/placeholder-1.png', alt: 'Certification 1' },
      { src: '/images/certs/placeholder-2.png', alt: 'Certification 2' },
      { src: '/images/certs/placeholder-3.png', alt: 'Certification 3' },
    ],
  },
  {
    type: 'link-list',
    label: 'Resources',
    links: [
      { label: 'GitHub', href: 'https://github.com/MomoChenisMe', external: true },
      { label: 'RSS Feed', href: '/feed.xml' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
];
