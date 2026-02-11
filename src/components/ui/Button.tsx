import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children?: ReactNode;
}

/**
 * Button 元件
 * 
 * Variants:
 * - primary: Rose 600 背景，白色文字 (Hover: Rose 700)
 * - secondary: Stone 100 背景，Stone 900 文字 (Hover: Stone 200)
 * - outline: 透明背景，Stone 600 文字，Stone 300 邊框 (Hover: Stone 100 背景)
 * - icon: 透明背景，Stone 600 文字 (Hover: Stone 100 背景)
 * 
 * @example
 * ```tsx
 * <Button variant="primary">Submit</Button>
 * <Button variant="secondary" onClick={handleClick}>Cancel</Button>
 * <Button variant="outline" loading={true}>Loading...</Button>
 * <Button variant="icon"><IconComponent /></Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'rounded-full px-6 py-2.5 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95',
    secondary: 'rounded-full px-6 py-2.5 bg-stone-100 text-stone-900 hover:bg-stone-200 active:scale-95',
    outline: 'rounded-full px-6 py-2.5 bg-transparent text-stone-600 border border-stone-300 hover:bg-stone-100 active:scale-95',
    icon: 'rounded-full p-2 bg-transparent text-stone-600 hover:bg-stone-100 active:scale-95',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
