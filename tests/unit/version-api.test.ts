/**
 * @file 版本 API Route Handler 測試
 * @description 測試版本歷史相關 API 端點的請求處理、認證、錯誤回應
 *   - GET /api/admin/posts/[id]/versions：取得版本列表
 *   - GET /api/admin/posts/[id]/versions/[versionId]：取得特定版本
 *   - POST /api/admin/posts/[id]/versions/[versionId]/restore：回溯版本
 *
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { GET as GET_VERSIONS } from '@/app/api/admin/posts/[id]/versions/route';
import { GET as GET_VERSION } from '@/app/api/admin/posts/[id]/versions/[versionId]/route';
import { POST as RESTORE } from '@/app/api/admin/posts/[id]/versions/[versionId]/restore/route';
import * as versionService from '@/services/version.service';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock version service
jest.mock('@/services/version.service');

const mockGetServerSession = getServerSession as jest.Mock;
const mockVersionService = versionService as jest.Mocked<typeof versionService>;

/** 建立 mock Request */
function createRequest(method: string): Request {
  return new Request('http://localhost:3000/api/admin/posts/post-1/versions', {
    method,
  });
}

/** Mock 版本資料 */
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

/** Mock 文章資料 */
function mockPost() {
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
  };
}

/** Mock session */
function mockSession() {
  return {
    user: { id: 'user-1', email: 'admin@test.com', name: 'Admin' },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== GET /api/admin/posts/[id]/versions =====
describe('GET /api/admin/posts/[id]/versions', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_VERSIONS(req, {
      params: Promise.resolve({ id: 'post-1' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized');
  });

  it('應回傳版本列表', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const versions = [
      mockVersion({ id: 'v-3', version: 3 }),
      mockVersion({ id: 'v-2', version: 2 }),
      mockVersion({ id: 'v-1', version: 1 }),
    ];
    mockVersionService.getVersions.mockResolvedValue(versions);

    const req = createRequest('GET');
    const res = await GET_VERSIONS(req, {
      params: Promise.resolve({ id: 'post-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(3);
  });

  it('service 錯誤應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockVersionService.getVersions.mockRejectedValue(new Error('DB error'));

    const req = createRequest('GET');
    const res = await GET_VERSIONS(req, {
      params: Promise.resolve({ id: 'post-1' }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ===== GET /api/admin/posts/[id]/versions/[versionId] =====
describe('GET /api/admin/posts/[id]/versions/[versionId]', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_VERSION(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-1' }),
    });

    expect(res.status).toBe(401);
  });

  it('應回傳指定版本', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const version = mockVersion();
    mockVersionService.getVersionById.mockResolvedValue(version);

    const req = createRequest('GET');
    const res = await GET_VERSION(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('version-1');
  });

  it('版本不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockVersionService.getVersionById.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_VERSION(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'non-existent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Version not found');
  });

  it('service 錯誤應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockVersionService.getVersionById.mockRejectedValue(new Error('DB error'));

    const req = createRequest('GET');
    const res = await GET_VERSION(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-1' }),
    });

    expect(res.status).toBe(500);
  });
});

// ===== POST /api/admin/posts/[id]/versions/[versionId]/restore =====
describe('POST /api/admin/posts/[id]/versions/[versionId]/restore', () => {
  it('未登入應回傳 401', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createRequest('POST');
    const res = await RESTORE(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-1' }),
    });

    expect(res.status).toBe(401);
  });

  it('應成功回溯版本', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    const post = mockPost();
    mockVersionService.restoreVersion.mockResolvedValue(post as any);

    const req = createRequest('POST');
    const res = await RESTORE(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-2' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('post-1');
    expect(mockVersionService.restoreVersion).toHaveBeenCalledWith(
      'post-1',
      'version-2'
    );
  });

  it('版本不存在應回傳 404', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockVersionService.restoreVersion.mockRejectedValue(
      new Error('Version not found')
    );

    const req = createRequest('POST');
    const res = await RESTORE(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'non-existent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Version not found');
  });

  it('service 錯誤應回傳 500', async () => {
    mockGetServerSession.mockResolvedValue(mockSession());
    mockVersionService.restoreVersion.mockRejectedValue(
      new Error('DB error')
    );

    const req = createRequest('POST');
    const res = await RESTORE(req, {
      params: Promise.resolve({ id: 'post-1', versionId: 'version-1' }),
    });

    expect(res.status).toBe(500);
  });
});
