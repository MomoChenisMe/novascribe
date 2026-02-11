'use client';

import { useState, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface NewsletterFormProps {
  title?: string;
  description?: string;
}

/**
 * NewsletterForm 元件
 * 
 * Newsletter 訂閱表單，用於首頁底部。
 * 
 * Features:
 * - Rose 50 背景色
 * - Email 格式驗證 (必填 + 格式正確)
 * - 成功訊息顯示 (綠色文字 + Checkmark icon)
 * - 提交後清空輸入框
 * - 暫不整合後端 API
 * 
 * @example
 * ```tsx
 * <NewsletterForm 
 *   title="訂閱電子報" 
 *   description="接收最新文章與科技新知" 
 * />
 * ```
 */
export default function NewsletterForm({
  title = '訂閱電子報',
  description = '接收最新文章與科技新知,每週直送您的信箱',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setError('請輸入電子郵件地址');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(false);

    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call (暫不整合後端)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setShowSuccess(true);
    setEmail('');
    setError('');

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  return (
    <section
      className="w-full bg-rose-50 py-12 px-4"
      data-testid="newsletter-form-section"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col gap-4"
          aria-label="Newsletter 訂閱表單"
          noValidate
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                error={error}
                aria-label="電子郵件地址"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="sm:w-auto w-full"
            >
              {isSubmitting ? '訂閱中...' : '訂閱'}
            </Button>
          </div>

          {showSuccess && (
            <div
              className="flex items-center gap-2 text-green-600 font-medium"
              role="alert"
              data-testid="success-message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>感謝您的訂閱！我們已收到您的電子郵件。</span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
