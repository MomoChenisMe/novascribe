import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

/**
 * Card 元件
 * 
 * 基礎卡片元件，支援 hover 效果。
 * 
 * Features:
 * - 白色背景 (--color-bg-card)
 * - rounded-2xl 圓角
 * - shadow-sm 陰影
 * - Hover: shadow-md + translate-y-1 (向上移動 4px)
 * 
 * @example
 * ```tsx
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here.</p>
 * </Card>
 * 
 * <Card hover={false}>Static Card (no hover effect)</Card>
 * ```
 */
export default function Card({
  hover = true,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-[var(--color-bg-card)] rounded-2xl shadow-sm transition-all duration-200 ease-out';
  const hoverStyles = hover ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
