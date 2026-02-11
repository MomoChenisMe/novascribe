import { HTMLAttributes, ReactNode } from 'react';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

/**
 * Footer 元件
 * 
 * 頁尾元件，支援三欄式佈局。
 * 
 * Features:
 * - 三欄式佈局: Left | Center | Right
 * - 行動裝置: 改為單欄堆疊 (flex-col)
 * - Stone 50 背景色
 * - 上邊框分隔線
 * - 內距: py-8 (Desktop), py-6 (Mobile)
 * 
 * @example
 * ```tsx
 * <Footer
 *   left={<p>© 2025 NovaScribe</p>}
 *   center={
 *     <nav>
 *       <Link href="/privacy">隱私權政策</Link>
 *       <Link href="/terms">服務條款</Link>
 *     </nav>
 *   }
 *   right={<SocialLinks />}
 * />
 * ```
 */
export default function Footer({
  left,
  center,
  right,
  className = '',
  ...props
}: FooterProps) {
  return (
    <footer
      className={`w-full bg-stone-50 border-t border-[var(--color-border-light)] ${className}`}
      {...props}
    >
      <div className="container-responsive py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          {/* Left Section */}
          {left && (
            <div className="text-sm text-[var(--color-text-secondary)] text-center md:text-left">
              {left}
            </div>
          )}

          {/* Center Section */}
          {center && (
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
              {center}
            </div>
          )}

          {/* Right Section */}
          {right && (
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              {right}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
