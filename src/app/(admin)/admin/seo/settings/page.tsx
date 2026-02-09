/**
 * @file 全站 SEO 設定頁面
 * @description /admin/seo/settings — 管理全站 SEO 設定
 *   - site title / description
 *   - GA4 Measurement ID
 *   - Google Search Console 驗證碼
 *   - 預設 OG image
 */

'use client';

import React, { useEffect, useState } from 'react';

interface SeoSettings {
  site_title: string;
  site_description: string;
  site_url: string;
  ga4_measurement_id: string;
  google_site_verification: string;
  default_og_image: string;
}

const DEFAULT_SETTINGS: SeoSettings = {
  site_title: '',
  site_description: '',
  site_url: '',
  ga4_measurement_id: '',
  google_site_verification: '',
  default_og_image: '',
};

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/seo/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...json.data });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/seo/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();

      if (json.success) {
        setMessage('設定已儲存');
      } else {
        setMessage(`儲存失敗：${json.error}`);
      }
    } catch {
      setMessage('無法連線到伺服器');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SeoSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">全站 SEO 設定</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本設定 */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">基本設定</legend>

          <div>
            <label htmlFor="site_title" className="block text-sm font-medium mb-1">
              網站標題
            </label>
            <input
              id="site_title"
              type="text"
              value={settings.site_title}
              onChange={(e) => handleChange('site_title', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="My Blog"
            />
          </div>

          <div>
            <label htmlFor="site_description" className="block text-sm font-medium mb-1">
              網站描述
            </label>
            <textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="A personal blog about..."
            />
          </div>

          <div>
            <label htmlFor="site_url" className="block text-sm font-medium mb-1">
              網站 URL
            </label>
            <input
              id="site_url"
              type="url"
              value={settings.site_url}
              onChange={(e) => handleChange('site_url', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="default_og_image" className="block text-sm font-medium mb-1">
              預設 OG Image URL
            </label>
            <input
              id="default_og_image"
              type="url"
              value={settings.default_og_image}
              onChange={(e) => handleChange('default_og_image', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://example.com/og-image.jpg"
            />
          </div>
        </fieldset>

        {/* 第三方整合 */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">第三方整合</legend>

          <div>
            <label htmlFor="ga4_measurement_id" className="block text-sm font-medium mb-1">
              GA4 Measurement ID
            </label>
            <input
              id="ga4_measurement_id"
              type="text"
              value={settings.ga4_measurement_id}
              onChange={(e) => handleChange('ga4_measurement_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-gray-500 mt-1">
              Google Analytics 4 的測量 ID
            </p>
          </div>

          <div>
            <label htmlFor="google_site_verification" className="block text-sm font-medium mb-1">
              Google Search Console 驗證碼
            </label>
            <input
              id="google_site_verification"
              type="text"
              value={settings.google_site_verification}
              onChange={(e) =>
                handleChange('google_site_verification', e.target.value)
              }
              className="w-full border rounded px-3 py-2"
              placeholder="verification-code"
            />
            <p className="text-xs text-gray-500 mt-1">
              Search Console HTML 標記驗證碼
            </p>
          </div>
        </fieldset>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.includes('失敗') || message.includes('無法')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
            data-testid="save-message"
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '儲存中...' : '儲存設定'}
        </button>
      </form>
    </div>
  );
}
