import { HTMLAttributes, ReactNode } from 'react';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  menu?: ReactNode;
  actions?: ReactNode;
}

/**
 * Navbar 元件
 * 
 * 導航列元件，支援 Sticky 定位與背景模糊效果。
 * 
 * Features:
 * - Sticky 定位 (sticky top-0)
 * - 背景模糊效果 (backdrop-blur-md)
 * - 三欄式佈局: Logo (左) | Menu (中) | Actions (右)
 * - 白色半透明背景 (bg-white/80)
 * - 底部分隔線 (border-b)
 * - 高度: 64px (h-16)
 * 
 * @example
 * ```tsx
 * <Navbar
 *   logo={<Link href="/"><Logo /></Link>}
 *   menu={
 *     <nav>
 *       <Link href="/posts">文章</Link>
 *       <Link href="/about">關於</Link>
 *     </nav>
 *   }
 *   actions={<Button variant="primary">Login</Button>}
 * />
 * ```
 */
export default function Navbar({
  logo,
  menu,
  actions,
  className = '',
  ...props
}: NavbarProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-[var(--color-border-light)] transition-all duration-200 ease-out ${className}`}
      {...props}
    >
      <div className="container-responsive h-16 flex items-center justify-between">
        {/* Logo Section */}
        {logo && (
          <div className="flex items-center">
            {logo}
          </div>
        )}

        {/* Menu Section (Desktop) */}
        {menu && (
          <div className="hidden md:flex items-center gap-6">
            {menu}
          </div>
        )}

        {/* Actions Section */}
        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
