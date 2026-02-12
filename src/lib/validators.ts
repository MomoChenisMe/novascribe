/**
 * @file 輸入資料驗證函式
 * @description 使用 Zod 定義驗證 schema，用於文章、分類、標籤、媒體上傳的輸入驗證。
 *   - PostStatusSchema: 文章狀態 enum
 *   - CreatePostSchema / UpdatePostSchema: 文章建立/更新
 *   - CreateCategorySchema / UpdateCategorySchema: 分類建立/更新
 *   - CreateTagSchema / UpdateTagSchema: 標籤建立/更新
 *   - MediaUploadSchema: 媒體上傳（檔案類型/大小）
 */

import { z } from 'zod';

/** PostStatus enum schema */
export const PostStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SCHEDULED',
  'ARCHIVED',
]);

/** 文章建立 schema */
export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  status: PostStatusSchema.default('DRAFT'),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

/** 文章更新 schema（所有欄位 optional） */
export const UpdatePostSchema = CreatePostSchema.partial();

/** 分類建立 schema */
export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  parentId: z.string().cuid().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

/** 分類更新 schema */
export const UpdateCategorySchema = CreateCategorySchema.partial();

/** 標籤建立 schema */
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

/** 標籤更新 schema */
export const UpdateTagSchema = CreateTagSchema.partial();

/** 媒體上傳驗證（檔案類型/大小） */
export const MediaUploadSchema = z.object({
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/),
  size: z
    .number()
    .int()
    .max(10 * 1024 * 1024), // 10 MB
});
