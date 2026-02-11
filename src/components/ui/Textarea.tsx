import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Textarea 元件
 * 
 * 多行文字輸入元件，支援 Label 與錯誤訊息顯示。
 * 
 * Features:
 * - 支援 label 標籤
 * - 支援 error 錯誤訊息 (紅色文字)
 * - Focus Ring: Rose 200 (--color-primary-ring)
 * - Placeholder: Stone 400 (--color-text-muted)
 * - 預設高度: 120px (可透過 rows 或 className 覆寫)
 * 
 * @example
 * ```tsx
 * <Textarea label="Message" placeholder="Enter your message..." rows={5} />
 * <Textarea label="Bio" error="Bio is required" />
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-[var(--color-bg-card)]
            border border-[var(--color-border-light)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:border-[var(--color-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y
            ${error ? 'border-[var(--color-error)] focus:ring-red-200' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
