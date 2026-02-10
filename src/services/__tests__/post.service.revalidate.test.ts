/**
 * @file ISR 快取管理單元測試
 * @description 測試文章 CRUD 操作後正確呼叫 revalidatePath
 */

import { createPost, updatePost, deletePost, updatePostStatus } from '@/services/post.service';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Post, PostStatus } from '@/generated/prisma/client';

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    postVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    postTag: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ISR Cache Management - revalidatePath Integration', () => {
  const testAuthorId = 'test-author-id';
  const testCategoryId = 'test-category-id';
  const testCategorySlug = 'test-category';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost - 清除快取', () => {
    it('應該在建立 PUBLISHED 文章後清除首頁和文章頁快取', async () => {
      const slug = 'test-post-slug';
      
      mockPrisma.post.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const mockPost: Post = {
          id: 'test-post-id',
          title: 'Test Post',
          slug,
          content: 'Test content',
          excerpt: null,
          coverImage: null,
          status: 'PUBLISHED' as PostStatus,
          publishedAt: new Date(),
          scheduledAt: null,
          categoryId: null,
          authorId: testAuthorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return mockPost;
      });

      await createPost({
        title: 'Test Post',
        slug,
        content: 'Test content',
        authorId: testAuthorId,
        status: 'PUBLISHED' as PostStatus,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${slug}`);
    });

    it('應該在建立有分類的 PUBLISHED 文章後清除分類頁快取', async () => {
      const slug = 'test-post-slug';
      
      mockPrisma.post.findUnique.mockResolvedValue(null);
      mockPrisma.category.findUnique.mockResolvedValue({
        id: testCategoryId,
        name: 'Test Category',
        slug: testCategorySlug,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const mockPost: Post = {
          id: 'test-post-id',
          title: 'Test Post',
          slug,
          content: 'Test content',
          excerpt: null,
          coverImage: null,
          status: 'PUBLISHED' as PostStatus,
          publishedAt: new Date(),
          scheduledAt: null,
          categoryId: testCategoryId,
          authorId: testAuthorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return mockPost;
      });

      await createPost({
        title: 'Test Post',
        slug,
        content: 'Test content',
        authorId: testAuthorId,
        categoryId: testCategoryId,
        status: 'PUBLISHED' as PostStatus,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${slug}`);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/categories/${testCategorySlug}`);
    });

    it('應該在建立 DRAFT 文章時不清除快取', async () => {
      const slug = 'test-draft-slug';
      
      mockPrisma.post.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const mockPost: Post = {
          id: 'test-post-id',
          title: 'Test Draft',
          slug,
          content: 'Test content',
          excerpt: null,
          coverImage: null,
          status: 'DRAFT' as PostStatus,
          publishedAt: null,
          scheduledAt: null,
          categoryId: null,
          authorId: testAuthorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return mockPost;
      });

      await createPost({
        title: 'Test Draft',
        slug,
        content: 'Test content',
        authorId: testAuthorId,
        status: 'DRAFT' as PostStatus,
      });

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updatePost - 清除快取', () => {
    it('應該在更新 PUBLISHED 文章後清除快取', async () => {
      const oldSlug = 'old-slug';
      const existingPost: Post = {
        id: 'test-post-id',
        title: 'Original Title',
        slug: oldSlug,
        content: 'Original content',
        excerpt: null,
        coverImage: null,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
        scheduledAt: null,
        categoryId: null,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 第一次呼叫：檢查文章存在
      mockPrisma.post.findUnique.mockResolvedValue(existingPost);

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return { ...existingPost, title: 'Updated Title' };
      });

      await updatePost('test-post-id', {
        title: 'Updated Title',
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${oldSlug}`);
    });

    it('應該在更新 slug 後清除新舊文章頁快取', async () => {
      const oldSlug = 'old-slug';
      const newSlug = 'new-slug';
      
      const existingPost: Post = {
        id: 'test-post-id',
        title: 'Test Post',
        slug: oldSlug,
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
        scheduledAt: null,
        categoryId: null,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock post.findUnique 順序：
      // 1. 檢查文章存在
      // 2. 檢查新 slug 唯一性
      mockPrisma.post.findUnique
        .mockResolvedValueOnce(existingPost)  // 檢查文章存在
        .mockResolvedValueOnce(null);         // slug 唯一性檢查（null = 唯一）

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return { ...existingPost, slug: newSlug };
      });

      await updatePost('test-post-id', {
        slug: newSlug,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${oldSlug}`);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${newSlug}`);
    });

    it('應該在更改分類後清除舊分類和新分類頁快取', async () => {
      const oldCategoryId = 'old-category-id';
      const newCategoryId = 'new-category-id';
      const oldCategorySlug = 'old-category';
      const newCategorySlug = 'new-category';

      const existingPost: Post = {
        id: 'test-post-id',
        title: 'Test Post',
        slug: 'test-slug',
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
        scheduledAt: null,
        categoryId: oldCategoryId,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock post.findUnique for checking existence (只需一次，因為沒有更改 slug)
      mockPrisma.post.findUnique.mockResolvedValue(existingPost);
      
      // Mock category.findUnique 呼叫順序：
      // 1. 清除舊分類快取時查詢舊分類
      // 2. 清除新分類快取時查詢新分類
      mockPrisma.category.findUnique
        .mockResolvedValueOnce({
          id: oldCategoryId,
          name: 'Old Category',
          slug: oldCategorySlug,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: newCategoryId,
          name: 'New Category',
          slug: newCategorySlug,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return { ...existingPost, categoryId: newCategoryId };
      });

      await updatePost('test-post-id', {
        categoryId: newCategoryId,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/categories/${oldCategorySlug}`);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/categories/${newCategorySlug}`);
    });
  });

  describe('deletePost - 清除快取', () => {
    it('應該在刪除 PUBLISHED 文章後清除快取', async () => {
      const slug = 'test-slug';
      const existingPost = {
        id: 'test-post-id',
        title: 'Test Post',
        slug,
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
        scheduledAt: null,
        categoryId: testCategoryId,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: testCategoryId,
          name: 'Test Category',
          slug: testCategorySlug,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      // deletePost 會先查詢文章（包含 category）
      mockPrisma.post.findUnique.mockResolvedValue(existingPost as any);
      mockPrisma.post.delete.mockResolvedValue(existingPost as any);

      await deletePost('test-post-id');

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${slug}`);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/categories/${testCategorySlug}`);
    });

    it('應該在刪除 DRAFT 文章時不清除快取', async () => {
      const existingPost = {
        id: 'test-post-id',
        title: 'Test Draft',
        slug: 'test-slug',
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'DRAFT' as PostStatus,
        publishedAt: null,
        scheduledAt: null,
        categoryId: null,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost as any);
      mockPrisma.post.delete.mockResolvedValue(existingPost as any);

      await deletePost('test-post-id');

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updatePostStatus - 清除快取', () => {
    it('應該在 DRAFT → PUBLISHED 時清除快取', async () => {
      const slug = 'test-slug';
      const existingPost = {
        id: 'test-post-id',
        title: 'Test Post',
        slug,
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'DRAFT' as PostStatus,
        publishedAt: null,
        scheduledAt: null,
        categoryId: testCategoryId,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: testCategoryId,
          name: 'Test Category',
          slug: testCategorySlug,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost as any);
      mockPrisma.post.update.mockResolvedValue({
        ...existingPost,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
      } as any);

      await updatePostStatus('test-post-id', 'PUBLISHED' as PostStatus);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${slug}`);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/categories/${testCategorySlug}`);
    });

    it('應該在 PUBLISHED → ARCHIVED 時清除快取', async () => {
      const slug = 'test-slug';
      const existingPost = {
        id: 'test-post-id',
        title: 'Test Post',
        slug,
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'PUBLISHED' as PostStatus,
        publishedAt: new Date(),
        scheduledAt: null,
        categoryId: null,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost as any);
      mockPrisma.post.update.mockResolvedValue({
        ...existingPost,
        status: 'ARCHIVED' as PostStatus,
      } as any);

      await updatePostStatus('test-post-id', 'ARCHIVED' as PostStatus);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/posts/${slug}`);
    });

    it('應該在 DRAFT → DRAFT 時不清除快取（狀態未變）', async () => {
      const existingPost = {
        id: 'test-post-id',
        title: 'Test Post',
        slug: 'test-slug',
        content: 'Test content',
        excerpt: null,
        coverImage: null,
        status: 'DRAFT' as PostStatus,
        publishedAt: null,
        scheduledAt: null,
        categoryId: null,
        authorId: testAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost as any);

      // DRAFT → DRAFT 不是有效的狀態轉換，應該拋出錯誤
      await expect(
        updatePostStatus('test-post-id', 'DRAFT' as PostStatus)
      ).rejects.toThrow('Invalid status transition');

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });
});
