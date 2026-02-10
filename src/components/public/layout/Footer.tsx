import Link from 'next/link';

/**
 * Footer 元件
 * 包含版權資訊、RSS 連結、社交連結、導航連結
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 網站資訊 */}
          <div>
            <h3 className="text-lg font-bold mb-4">NovaScribe</h3>
            <p className="text-gray-600 dark:text-gray-400">
              分享技術見解與生活體驗
            </p>
          </div>

          {/* 導航連結 */}
          <div>
            <h3 className="text-lg font-bold mb-4">導航</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                首頁
              </Link>
              <Link href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                分類
              </Link>
              <Link href="/tags" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                標籤
              </Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                關於
              </Link>
            </nav>
          </div>

          {/* RSS & 社交連結 */}
          <div>
            <h3 className="text-lg font-bold mb-4">訂閱</h3>
            <div className="flex flex-col gap-2">
              <a 
                href="/feed.xml" 
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                RSS 2.0
              </a>
              <a 
                href="/feed/atom.xml" 
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Atom
              </a>
            </div>

            {/* 社交連結（可選） */}
            <div className="flex gap-4 mt-4">
              {/* 範例：GitHub */}
              {process.env.NEXT_PUBLIC_GITHUB_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  GitHub
                </a>
              )}
              {/* 範例：Twitter */}
              {process.env.NEXT_PUBLIC_TWITTER_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 版權資訊 */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-gray-600 dark:text-gray-400">
          © {currentYear} NovaScribe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
