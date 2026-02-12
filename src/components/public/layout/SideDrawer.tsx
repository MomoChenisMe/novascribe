'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDrawerStore } from '@/lib/store/drawer';
import { useEffect } from 'react';

// TODO: 此處資料結構未來應從 Config 或 API 讀取
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/MomoChenisMe' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
];

export const SideDrawer = () => {
  const { isOpen, close } = useDrawerStore();
  const pathname = usePathname();

  // 路由切換時自動關閉 Drawer
  useEffect(() => {
    close();
  }, [pathname, close]);

  // 按下 ESC 關閉 Drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [close]);

  // 鎖定 Body 捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-bg-sidebar border-r border-border-light z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex-1 overflow-y-auto py-20 px-8">
          {/* User Profile Area */}
          <div className="mb-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full mb-4 overflow-hidden">
               {/* TODO: Replace with Next/Image and real avatar */}
               <div className="w-full h-full bg-stone-200" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Momo Chen</h2>
            <p className="text-sm text-text-secondary mt-1">
              AI Engineer & System Architect
            </p>
            <p className="text-sm text-text-muted mt-4 leading-relaxed">
              Exploring the frontiers of AI agents, system design, and digital craftsmanship.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-2xl font-bold transition-colors ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-text-primary hover:text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-8 border-t border-border-light bg-bg-sidebar">
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-6">
            © {new Date().getFullYear()} NovaScribe. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
};
