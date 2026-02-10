import { Metadata } from 'next';
import WebSiteJsonLd from '@/components/seo/WebSiteJsonLd';

const SITE_NAME = 'NovaScribe';
const SITE_DESCRIPTION = '技術部落格 - 分享程式開發、前端技術與實作經驗';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novascribe.example.com';

/**
 * 首頁 SEO metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${SITE_NAME} - ${SITE_DESCRIPTION}`,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
  };
}

/**
 * 首頁
 */
export default async function HomePage() {
  // TODO: 載入文章列表
  
  return (
    <>
      {/* WebSite JSON-LD */}
      <WebSiteJsonLd
        name={SITE_NAME}
        description={SITE_DESCRIPTION}
        url={SITE_URL}
      />

      {/* 首頁內容（稍後完整實作） */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">最新文章</h1>
        <p className="text-gray-600">首頁內容稍後實作</p>
      </div>
    </>
  );
}

// ISR 設定：每 5 分鐘重新驗證
export const revalidate = 300;

export { metadata } from '@/app/(public)/page';
