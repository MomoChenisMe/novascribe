'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export interface FloatingActionsProps {
  postTitle: string;
  postUrl: string;
}

/**
 * FloatingActions 元件
 * 
 * 文章頁浮動操作按鈕，支援分享（Twitter, Facebook, 複製連結）與回到頂部功能。
 * 
 * 響應式定位：
 * - Desktop (>=768px): 左側固定定位 (fixed left-8 top-1/2 -translate-y-1/2)
 * - Mobile (<768px): 底部固定定位 (fixed bottom-8 right-8)
 * 
 * 捲動行為：
 * - 回到頂部按鈕僅在捲動超過 500px 時顯示
 * 
 * @example
 * ```tsx
 * <FloatingActions 
 *   postTitle="文章標題" 
 *   postUrl="https://example.com/posts/slug" 
 * />
 * ```
 */
export default function FloatingActions({ postTitle, postUrl }: FloatingActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);

  // 監聽捲動事件，決定是否顯示回到頂部按鈕
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 分享功能：優先使用 Web Share API，fallback 至 URL 分享
  const handleShare = (platform: 'twitter' | 'facebook' | 'native') => {
    // 優先使用原生分享 API (行動裝置支援)
    if (platform === 'native' && typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: postTitle,
          url: postUrl,
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
          }
        });
      return;
    }

    // Fallback: 開啟社群平台分享 URL
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // 複製連結功能：使用 Clipboard API
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // 平滑捲動至頂部
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Desktop: 左側固定定位 */}
      <div className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        {/* 分享按鈕 - Twitter */}
        <Button
          variant="icon"
          onClick={() => handleShare('twitter')}
          aria-label="分享到 Twitter"
          title="分享到 Twitter"
          className="shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Button>

        {/* 分享按鈕 - Facebook */}
        <Button
          variant="icon"
          onClick={() => handleShare('facebook')}
          aria-label="分享到 Facebook"
          title="分享到 Facebook"
          className="shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </Button>

        {/* 複製連結按鈕 */}
        <Button
          variant="icon"
          onClick={handleCopyLink}
          aria-label="複製連結"
          title={copied ? '已複製' : '複製連結'}
          className="shadow-md hover:shadow-lg"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </Button>

        {/* 回到頂部按鈕 - 捲動超過 500px 才顯示 */}
        {showScrollTop && (
          <Button
            variant="icon"
            onClick={handleScrollToTop}
            aria-label="回到頂部"
            title="回到頂部"
            className="shadow-md hover:shadow-lg animate-fade-in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </Button>
        )}
      </div>

      {/* Mobile: 底部固定定位 */}
      <div className="md:hidden fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        {/* 分享按鈕 - 優先使用原生分享 API */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            variant="icon"
            onClick={() => handleShare('native')}
            aria-label="分享文章"
            title="分享文章"
            className="shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </Button>
        )}

        {/* 複製連結按鈕 */}
        <Button
          variant="icon"
          onClick={handleCopyLink}
          aria-label="複製連結"
          title={copied ? '已複製' : '複製連結'}
          className="shadow-lg hover:shadow-xl"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </Button>

        {/* 回到頂部按鈕 - 捲動超過 500px 才顯示 */}
        {showScrollTop && (
          <Button
            variant="icon"
            onClick={handleScrollToTop}
            aria-label="回到頂部"
            title="回到頂部"
            className="shadow-lg hover:shadow-xl animate-fade-in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </Button>
        )}
      </div>
    </>
  );
}
