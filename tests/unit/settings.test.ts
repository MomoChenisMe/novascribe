/**
 * @file getSettingValue / setSettingValue 工具函式單元測試
 * @description 測試 site_settings 讀寫工具函式
 *   - getSettingValue: 讀取存在/不存在的設定
 *   - setSettingValue: 建立/更新設定
 *   - getSettingValues: 批量讀取
 *
 * @jest-environment node
 */

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    siteSetting: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { getSettingValue, setSettingValue, getSettingValues } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('getSettingValue()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('設定存在時應回傳值', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue({
      key: 'seo.default_title',
      value: 'My Blog',
    });

    const result = await getSettingValue('seo.default_title');

    expect(result).toBe('My Blog');
    expect(mockPrisma.siteSetting.findUnique).toHaveBeenCalledWith({
      where: { key: 'seo.default_title' },
    });
  });

  it('設定不存在時應回傳 null', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getSettingValue('nonexistent.key');

    expect(result).toBeNull();
  });
});

describe('setSettingValue()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應使用 upsert 寫入設定', async () => {
    (mockPrisma.siteSetting.upsert as jest.Mock).mockResolvedValue({
      key: 'seo.default_title',
      value: 'New Title',
    });

    await setSettingValue('seo.default_title', 'New Title');

    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith({
      where: { key: 'seo.default_title' },
      update: { value: 'New Title' },
      create: { key: 'seo.default_title', value: 'New Title' },
    });
  });

  it('應成功更新既有設定', async () => {
    (mockPrisma.siteSetting.upsert as jest.Mock).mockResolvedValue({
      key: 'seo.og_image',
      value: 'https://example.com/new-og.jpg',
    });

    await setSettingValue('seo.og_image', 'https://example.com/new-og.jpg');

    expect(mockPrisma.siteSetting.upsert).toHaveBeenCalled();
  });
});

describe('getSettingValues()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應批量取得多個設定值', async () => {
    (mockPrisma.siteSetting.findMany as jest.Mock).mockResolvedValue([
      { key: 'seo.default_title', value: 'My Blog' },
      { key: 'seo.default_description', value: 'A great blog' },
    ]);

    const result = await getSettingValues([
      'seo.default_title',
      'seo.default_description',
      'seo.og_image',
    ]);

    expect(result['seo.default_title']).toBe('My Blog');
    expect(result['seo.default_description']).toBe('A great blog');
    expect(result['seo.og_image']).toBeNull();
  });

  it('全部不存在時應回傳全 null', async () => {
    (mockPrisma.siteSetting.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getSettingValues(['key1', 'key2']);

    expect(result['key1']).toBeNull();
    expect(result['key2']).toBeNull();
  });

  it('空陣列應回傳空物件', async () => {
    (mockPrisma.siteSetting.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getSettingValues([]);

    expect(result).toEqual({});
  });
});
