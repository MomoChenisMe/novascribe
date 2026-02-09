/**
 * @file 版本 Service 層測試
 * @description 測試版本歷史完整邏輯
 *   - createVersion：建立版本（版本號自動遞增）
 *   - getVersions：取得版本列表（最新在前）
 *   - getVersionById：取得特定版本
 *   - compareVersions：比對兩個版本的差異
 *   - restoreVersion：回溯到指定版本
 *   - cleanOldVersions：清理舊版本（保留最新 N 個）
 */

import {
  createVersion,
  getVersions,
  getVersionById,
  compareVersions,
  restoreVersion,
  cleanOldVersions,
} from '@/services/version.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    postVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    post: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** 建立 mock 版本資料 */
function mockVersion(
  overrides: Partial<{
    id: string;
    postId: string;
    title: string;
    content: string;
    version: number;
    createdAt: Date;
  }> = {}
) {
  return {
    id: 'version-1',
    postId: 'post-1',
    title: '測試文章',
    content: '# 測試內容',
    version: 1,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/** 建立 mock 文章資料 */
function mockPost(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    content: string;
    status: string;
  }> = {}
) {
  return {
    id: 'post-1',
    title: '測試文章',
    slug: 'test-post',
    content: '# 測試內容',
    excerpt: null,
    coverImage: null,
    status: 'DRAFT',
    publishedAt: null,
    scheduledAt: null,
    authorId: 'user-1',
    categoryId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== createVersion =====
describe('createVersion', () => {
  it('應建立第一個版本（version=1）', async () => {
    const version = mockVersion({ version: 1 });
    (mockPrisma.postVersion.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.postVersion.create as jest.Mock).mockResolvedValue(version);

    const result = await createVersion({
      postId: 'post-1',
      title: '測試文章',
      content: '# 測試內容',
    });

    expect(result).toEqual(version);
    expect(mockPrisma.postVersion.findFirst).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
      orderBy: { version: 'desc' },
    });
    expect(mockPrisma.postVersion.create).toHaveBeenCalledWith({
      data: {
        postId: 'post-1',
        title: '測試文章',
        content: '# 測試內容',
        version: 1,
      },
    });
  });

  it('應自動遞增版本號', async () => {
    const existingVersion = mockVersion({ version: 3 });
    const newVersion = mockVersion({ id: 'version-4', version: 4 });
    (mockPrisma.postVersion.findFirst as jest.Mock).mockResolvedValue(
      existingVersion
    );
    (mockPrisma.postVersion.create as jest.Mock).mockResolvedValue(newVersion);

    const result = await createVersion({
      postId: 'post-1',
      title: '更新的標題',
      content: '# 更新的內容',
    });

    expect(result).toEqual(newVersion);
    expect(mockPrisma.postVersion.create).toHaveBeenCalledWith({
      data: {
        postId: 'post-1',
        title: '更新的標題',
        content: '# 更新的內容',
        version: 4,
      },
    });
  });
});

// ===== getVersions =====
describe('getVersions', () => {
  it('應回傳版本列表（最新在前）', async () => {
    const versions = [
      mockVersion({ id: 'version-3', version: 3 }),
      mockVersion({ id: 'version-2', version: 2 }),
      mockVersion({ id: 'version-1', version: 1 }),
    ];
    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue(versions);

    const result = await getVersions('post-1');

    expect(result).toEqual(versions);
    expect(mockPrisma.postVersion.findMany).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
      orderBy: { version: 'desc' },
    });
  });

  it('無版本時應回傳空陣列', async () => {
    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getVersions('post-1');

    expect(result).toEqual([]);
  });
});

// ===== getVersionById =====
describe('getVersionById', () => {
  it('應回傳指定版本', async () => {
    const version = mockVersion();
    (mockPrisma.postVersion.findFirst as jest.Mock).mockResolvedValue(version);

    const result = await getVersionById('post-1', 'version-1');

    expect(result).toEqual(version);
    expect(mockPrisma.postVersion.findFirst).toHaveBeenCalledWith({
      where: { id: 'version-1', postId: 'post-1' },
    });
  });

  it('版本不存在時應回傳 null', async () => {
    (mockPrisma.postVersion.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await getVersionById('post-1', 'non-existent');

    expect(result).toBeNull();
  });
});

// ===== compareVersions =====
describe('compareVersions', () => {
  it('應比對兩個版本的差異（標題不同）', async () => {
    const fromVersion = mockVersion({
      id: 'v-1',
      version: 1,
      title: '原始標題',
      content: '第一行\n第二行',
    });
    const toVersion = mockVersion({
      id: 'v-2',
      version: 2,
      title: '新標題',
      content: '第一行\n第二行',
    });
    (mockPrisma.postVersion.findFirst as jest.Mock)
      .mockResolvedValueOnce(fromVersion)
      .mockResolvedValueOnce(toVersion);

    const result = await compareVersions('post-1', 1, 2);

    expect(result.summary).toBeDefined();
    expect(result.details?.titleChanged).toBe(true);
  });

  it('應比對兩個版本的差異（內容不同）', async () => {
    const fromVersion = mockVersion({
      id: 'v-1',
      version: 1,
      title: '相同標題',
      content: '第一行\n第二行\n第三行',
    });
    const toVersion = mockVersion({
      id: 'v-2',
      version: 2,
      title: '相同標題',
      content: '第一行\n修改行\n第三行\n新增行',
    });
    (mockPrisma.postVersion.findFirst as jest.Mock)
      .mockResolvedValueOnce(fromVersion)
      .mockResolvedValueOnce(toVersion);

    const result = await compareVersions('post-1', 1, 2);

    expect(result.details?.titleChanged).toBe(false);
    expect(result.details?.contentChanges.added).toBeGreaterThanOrEqual(0);
    expect(result.details?.contentChanges.removed).toBeGreaterThanOrEqual(0);
  });

  it('版本完全相同時應回傳無變更', async () => {
    const version = mockVersion({
      id: 'v-1',
      version: 1,
      title: '相同標題',
      content: '相同內容',
    });
    (mockPrisma.postVersion.findFirst as jest.Mock)
      .mockResolvedValueOnce(version)
      .mockResolvedValueOnce({ ...version, id: 'v-2', version: 2 });

    const result = await compareVersions('post-1', 1, 2);

    expect(result.details?.titleChanged).toBe(false);
    expect(result.details?.contentChanges.added).toBe(0);
    expect(result.details?.contentChanges.removed).toBe(0);
  });

  it('版本不存在時應拋出錯誤', async () => {
    (mockPrisma.postVersion.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(compareVersions('post-1', 1, 2)).rejects.toThrow(
      'Version 1 not found'
    );
  });
});

// ===== restoreVersion =====
describe('restoreVersion', () => {
  it('應回溯到指定版本並建立新版本', async () => {
    const targetVersion = mockVersion({
      id: 'version-2',
      version: 2,
      title: 'v2 標題',
      content: 'v2 內容',
    });
    const updatedPost = mockPost({
      title: 'v2 標題',
      content: 'v2 內容',
    });

    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        postVersion: {
          findFirst: jest
            .fn()
            .mockResolvedValueOnce(targetVersion)
            .mockResolvedValueOnce(mockVersion({ version: 3 })),
          create: jest.fn().mockResolvedValue(mockVersion({ version: 4 })),
        },
        post: {
          update: jest.fn().mockResolvedValue(updatedPost),
        },
      };
      return fn(tx);
    });

    const result = await restoreVersion('post-1', 'version-2');

    expect(result).toEqual(updatedPost);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('版本不存在時應拋出錯誤', async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        postVersion: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
        post: {},
      };
      return fn(tx);
    });

    await expect(restoreVersion('post-1', 'non-existent')).rejects.toThrow(
      'Version not found'
    );
  });
});

// ===== cleanOldVersions =====
describe('cleanOldVersions', () => {
  it('應保留最新 10 個版本（預設）', async () => {
    const versions = Array.from({ length: 15 }, (_, i) =>
      mockVersion({ id: `v-${i + 1}`, version: i + 1 })
    ).reverse(); // 最新在前

    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue(versions);
    (mockPrisma.postVersion.deleteMany as jest.Mock).mockResolvedValue({
      count: 5,
    });

    const result = await cleanOldVersions('post-1');

    expect(result).toBe(5);
    expect(mockPrisma.postVersion.findMany).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
      orderBy: { version: 'desc' },
    });
  });

  it('應保留指定數量的版本', async () => {
    const versions = Array.from({ length: 8 }, (_, i) =>
      mockVersion({ id: `v-${i + 1}`, version: i + 1 })
    ).reverse();

    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue(versions);
    (mockPrisma.postVersion.deleteMany as jest.Mock).mockResolvedValue({
      count: 3,
    });

    const result = await cleanOldVersions('post-1', 5);

    expect(result).toBe(3);
  });

  it('版本數量不超過上限時不刪除', async () => {
    const versions = Array.from({ length: 3 }, (_, i) =>
      mockVersion({ id: `v-${i + 1}`, version: i + 1 })
    ).reverse();

    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue(versions);

    const result = await cleanOldVersions('post-1');

    expect(result).toBe(0);
    expect(mockPrisma.postVersion.deleteMany).not.toHaveBeenCalled();
  });

  it('沒有版本時應回傳 0', async () => {
    (mockPrisma.postVersion.findMany as jest.Mock).mockResolvedValue([]);

    const result = await cleanOldVersions('post-1');

    expect(result).toBe(0);
    expect(mockPrisma.postVersion.deleteMany).not.toHaveBeenCalled();
  });
});
