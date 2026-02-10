import { Metadata } from 'next'

export const revalidate = 3600 // 每小時重新驗證

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'NovaScribe — 關於',
    description: '關於 NovaScribe 部落格與作者的介紹，包含技術棧、聯絡方式等資訊。',
    openGraph: {
      title: 'NovaScribe — 關於',
      description: '關於 NovaScribe 部落格與作者的介紹，包含技術棧、聯絡方式等資訊。',
      type: 'website',
      url: 'https://novascribe.dev/about',
    },
    twitter: {
      card: 'summary',
      title: 'NovaScribe — 關於',
      description: '關於 NovaScribe 部落格與作者的介紹，包含技術棧、聯絡方式等資訊。',
    },
    alternates: {
      canonical: '/about',
    },
  }
}

export default async function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          關於 NovaScribe
        </h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            部落格介紹
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            NovaScribe 是一個專注於技術分享、開發經驗和思考筆記的個人部落格。這裡記錄了關於前端開發、後端架構、資料庫設計、軟體工程實踐等主題的文章。
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
            我們相信透過分享與交流，能夠讓技術社群變得更好。無論您是初學者還是資深開發者，都歡迎在這裡找到有價值的內容。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            技術棧
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            本部落格使用以下技術建構：
          </p>
          <ul className="list-disc list-inside text-lg text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Next.js 16</strong> — React 框架，支援 Server Components 與 ISR</li>
            <li><strong>TypeScript</strong> — 型別安全的 JavaScript</li>
            <li><strong>Tailwind CSS v4</strong> — 實用優先的 CSS 框架</li>
            <li><strong>Prisma</strong> — 現代化的 ORM</li>
            <li><strong>PostgreSQL</strong> — 強大的關聯式資料庫</li>
            <li><strong>Shiki</strong> — 程式碼語法高亮</li>
            <li><strong>unified</strong> — Markdown 處理引擎</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            關於作者
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            一位熱愛程式設計與技術寫作的開發者，專注於全端開發與軟體架構設計。喜歡探索新技術，並將學習到的知識整理成文章分享給大家。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            聯絡方式
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            如果您有任何問題、建議或合作邀約，歡迎透過以下方式聯絡：
          </p>
          <ul className="list-none text-lg text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>📧 Email: hello@novascribe.dev</li>
            <li>🐙 GitHub: <a href="https://github.com/novascribe" className="text-blue-600 dark:text-blue-400 hover:underline">@novascribe</a></li>
            <li>🐦 Twitter: <a href="https://twitter.com/novascribe" className="text-blue-600 dark:text-blue-400 hover:underline">@novascribe</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            訂閱更新
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            您可以透過 <a href="/feed.xml" className="text-blue-600 dark:text-blue-400 hover:underline">RSS Feed</a> 訂閱本部落格的最新文章，或是在社群媒體上關注我們以接收即時更新。
          </p>
        </section>
      </div>
    </div>
  )
}
