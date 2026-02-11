import { HTMLAttributes, ReactNode } from 'react';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/**
 * Tag 元件
 * 
 * 標籤元件，用於顯示分類與標籤。
 * 
 * Features:
 * - Stone 100 背景，Stone 600 文字
 * - Hover: Rose 50 背景，Rose 600 文字
 * - 膠囊型圓角 (rounded-full)
 * - 小字體 (text-sm)
 * 
 * @example
 * ```tsx
 * <Tag>技術</Tag>
 * <Tag onClick={handleClick}>React</Tag>
 * ```
 */
export default function Tag({
  className = '',
  children,
  ...props
}: TagProps) {
  const baseStyles = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ease-out';
  const colorStyles = 'bg-stone-100 text-stone-600 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] cursor-pointer';

  return (
    <span
      className={`${baseStyles} ${colorStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
