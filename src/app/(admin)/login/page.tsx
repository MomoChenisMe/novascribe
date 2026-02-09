'use client';

/**
 * @file 登入頁面
 * @description 管理後台登入頁面，使用 NextAuth.js Credentials Provider 進行認證。
 *   - Email + 密碼表單
 *   - 表單驗證（email 格式、密碼不可為空）
 *   - 錯誤訊息顯示
 *   - 載入狀態
 *   - 登入成功後重新導向至 /admin
 *   - 已登入使用者自動導向至 /admin
 */

import { useState, useEffect, type FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/** 表單驗證錯誤 */
interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 已登入使用者自動導向至 /admin
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin');
    }
  }, [status, router]);

  /** 表單驗證 */
  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = '請輸入 email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '請輸入有效的 email';
    }

    if (!password) {
      newErrors.password = '請輸入密碼';
    }

    return newErrors;
  }

  /** 處理表單提交 */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError('');

    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/admin');
      } else if (result?.error === 'RATE_LIMITED') {
        setLoginError('登入嘗試次數過多，請稍後再試');
      } else {
        setLoginError('帳號或密碼錯誤');
      }
    } catch {
      setLoginError('登入時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  }

  // Session 載入中時顯示空白
  if (status === 'loading') {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            登入
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            登入 NovaScribe 管理後台
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          {/* 登入錯誤訊息 */}
          {loginError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {loginError}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* 密碼 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* 登入按鈕 */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
