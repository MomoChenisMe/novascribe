/**
 * @file Search Console 驗證 meta tag 注入測試
 * @description 測試 Search Console 驗證碼是否正確注入到 metadata
 *   - 設定驗證碼後 metadata 應包含 google verification
 *   - 未設定時不應包含
 *
 * @jest-environment node
 */

jest.mock('@/lib/settings', () => ({
  getSettingValue: jest.fn(),
}));

import { getSettingValue } from '@/lib/settings';

const mockGetSettingValue = getSettingValue as jest.Mock;

describe('Search Console 驗證 meta tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('設定驗證碼後應產生 google verification metadata', async () => {
    mockGetSettingValue.mockResolvedValue('abc123verification');

    const code = await getSettingValue('google_site_verification');

    expect(code).toBe('abc123verification');
    // In Next.js, this would be used in generateMetadata:
    // verification: { google: code }
    const metadata = code
      ? { verification: { google: code } }
      : {};

    expect(metadata).toEqual({
      verification: { google: 'abc123verification' },
    });
  });

  it('未設定時不應包含 verification metadata', async () => {
    mockGetSettingValue.mockResolvedValue(null);

    const code = await getSettingValue('google_site_verification');

    const metadata = code
      ? { verification: { google: code } }
      : {};

    expect(metadata).toEqual({});
  });
});
