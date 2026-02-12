'use client';

import { useEffect, useState } from 'react';

/**
 * 主題切換按鈕
 * 支援 light/dark 切換、localStorage 持久化、系統偏好偵測
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 從 localStorage 讀取主題，或使用系統偏好
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialTheme = storedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // 防止 SSR 時閃爍
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5 block">🌓</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="w-5 h-5 block">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  );
}
