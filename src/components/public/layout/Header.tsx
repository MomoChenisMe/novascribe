'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Header 元件
 * 包含 Logo、導航連結、搜尋入口、Dark mode 切換、響應式漢堡選單
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark">
            NovaScribe
          </Link>

          {/* Desktop Navigation */}
          <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 absolute md:relative top-full left-0 w-full md:w-auto bg-white dark:bg-gray-900 md:bg-transparent p-4 md:p-0 border-b md:border-0 border-gray-200 dark:border-gray-700`} role="navigation">
            <Link href="/" className="hover:text-primary transition-colors">
              首頁
            </Link>
            <Link href="/categories" className="hover:text-primary transition-colors">
              分類
            </Link>
            <Link href="/tags" className="hover:text-primary transition-colors">
              標籤
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              關於
            </Link>

            {/* Search Form */}
            <form action="/search" method="get" className="w-full md:w-auto">
              <input
                type="search"
                name="q"
                placeholder="搜尋文章..."
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            {/* Theme Toggle - Desktop only in nav, mobile shows separately */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Right Side: Theme Toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
