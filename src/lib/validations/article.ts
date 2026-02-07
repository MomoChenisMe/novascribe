import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "標題為必填").max(100, "標題最多 100 字元"),
  content: z.string().default(""),
  excerpt: z.string().max(200, "摘要最多 200 字元").optional(),
  categoryId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  scheduledAt: z.string().datetime().optional().nullable(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
