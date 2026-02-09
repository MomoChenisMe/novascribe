/**
 * @file 驗證工具函式測試
 * @description 測試 Zod schema 驗證：文章、分類、標籤、媒體上傳
 *   - 成功案例：合法輸入
 *   - 失敗案例：缺少必填欄位、超過長度限制、格式不符
 */

import {
  PostStatusSchema,
  CreatePostSchema,
  UpdatePostSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateTagSchema,
  UpdateTagSchema,
  MediaUploadSchema,
} from '@/lib/validators';

describe('PostStatusSchema', () => {
  it.each(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])(
    '應接受有效狀態: %s',
    (status) => {
      expect(PostStatusSchema.parse(status)).toBe(status);
    }
  );

  it('應拒絕無效狀態', () => {
    expect(() => PostStatusSchema.parse('DELETED')).toThrow();
  });

  it('應拒絕空字串', () => {
    expect(() => PostStatusSchema.parse('')).toThrow();
  });
});

describe('CreatePostSchema', () => {
  const validPost = {
    title: 'Test Post',
    slug: 'test-post',
    content: 'This is test content.',
  };

  it('應接受最小必填欄位', () => {
    const result = CreatePostSchema.parse(validPost);
    expect(result.title).toBe('Test Post');
    expect(result.slug).toBe('test-post');
    expect(result.content).toBe('This is test content.');
    expect(result.status).toBe('DRAFT'); // 預設值
  });

  it('應接受所有欄位', () => {
    const fullPost = {
      ...validPost,
      excerpt: 'A brief excerpt',
      coverImage: 'https://example.com/image.jpg',
      status: 'PUBLISHED' as const,
      publishedAt: '2024-01-01T00:00:00.000Z',
      scheduledAt: '2024-02-01T00:00:00.000Z',
      categoryId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
      tagIds: ['clxxxxxxxxxxxxxxxxxxxxxxxxx'],
    };
    const result = CreatePostSchema.parse(fullPost);
    expect(result.status).toBe('PUBLISHED');
    expect(result.excerpt).toBe('A brief excerpt');
  });

  describe('title 驗證', () => {
    it('應拒絕空 title', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, title: '' })
      ).toThrow();
    });

    it('應拒絕超過 200 字的 title', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, title: 'a'.repeat(201) })
      ).toThrow();
    });

    it('應接受 200 字的 title', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        title: 'a'.repeat(200),
      });
      expect(result.title.length).toBe(200);
    });
  });

  describe('slug 驗證', () => {
    it('應拒絕空 slug', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, slug: '' })
      ).toThrow();
    });

    it('應拒絕含大寫的 slug', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, slug: 'Hello-World' })
      ).toThrow();
    });

    it('應拒絕含空格的 slug', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, slug: 'hello world' })
      ).toThrow();
    });

    it('應拒絕含特殊字元的 slug', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, slug: 'hello_world!' })
      ).toThrow();
    });

    it('應接受數字和 hyphen 的 slug', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        slug: 'post-123-test',
      });
      expect(result.slug).toBe('post-123-test');
    });

    it('應拒絕超過 200 字的 slug', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, slug: 'a'.repeat(201) })
      ).toThrow();
    });
  });

  describe('content 驗證', () => {
    it('應拒絕空 content', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, content: '' })
      ).toThrow();
    });
  });

  describe('excerpt 驗證', () => {
    it('應接受省略 excerpt', () => {
      const result = CreatePostSchema.parse(validPost);
      expect(result.excerpt).toBeUndefined();
    });

    it('應拒絕超過 500 字的 excerpt', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, excerpt: 'a'.repeat(501) })
      ).toThrow();
    });

    it('應接受 500 字的 excerpt', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        excerpt: 'a'.repeat(500),
      });
      expect(result.excerpt?.length).toBe(500);
    });
  });

  describe('coverImage 驗證', () => {
    it('應接受合法 URL', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        coverImage: 'https://example.com/img.png',
      });
      expect(result.coverImage).toBe('https://example.com/img.png');
    });

    it('應拒絕非 URL 格式', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, coverImage: 'not-a-url' })
      ).toThrow();
    });
  });

  describe('categoryId 驗證', () => {
    it('應接受合法 CUID', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        categoryId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
      });
      expect(result.categoryId).toBe('clxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('應拒絕非 CUID 格式', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, categoryId: '123' })
      ).toThrow();
    });
  });

  describe('tagIds 驗證', () => {
    it('應接受 CUID 陣列', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        tagIds: [
          'clxxxxxxxxxxxxxxxxxxxxxxxxx',
          'clyyyyyyyyyyyyyyyyyyyyyyyyy',
        ],
      });
      expect(result.tagIds).toHaveLength(2);
    });

    it('應拒絕包含非 CUID 的陣列', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, tagIds: ['invalid'] })
      ).toThrow();
    });
  });

  describe('publishedAt / scheduledAt 驗證', () => {
    it('應接受 ISO datetime', () => {
      const result = CreatePostSchema.parse({
        ...validPost,
        publishedAt: '2024-06-15T10:30:00.000Z',
      });
      expect(result.publishedAt).toBe('2024-06-15T10:30:00.000Z');
    });

    it('應拒絕非 datetime 格式', () => {
      expect(() =>
        CreatePostSchema.parse({ ...validPost, publishedAt: '2024-01-01' })
      ).toThrow();
    });
  });
});

describe('UpdatePostSchema', () => {
  it('應接受空物件（所有欄位 optional）', () => {
    const result = UpdatePostSchema.parse({});
    // status 有 default('DRAFT')，partial() 後仍會套用預設值
    expect(result).toEqual({ status: 'DRAFT' });
  });

  it('應接受部分欄位', () => {
    const result = UpdatePostSchema.parse({ title: 'Updated Title' });
    expect(result.title).toBe('Updated Title');
  });

  it('應對提供的欄位進行驗證', () => {
    expect(() => UpdatePostSchema.parse({ title: '' })).toThrow();
  });

  it('應對提供的 slug 進行格式驗證', () => {
    expect(() => UpdatePostSchema.parse({ slug: 'INVALID SLUG' })).toThrow();
  });
});

describe('CreateCategorySchema', () => {
  const validCategory = {
    name: 'Technology',
    slug: 'technology',
  };

  it('應接受最小必填欄位', () => {
    const result = CreateCategorySchema.parse(validCategory);
    expect(result.name).toBe('Technology');
    expect(result.slug).toBe('technology');
    expect(result.sortOrder).toBe(0); // 預設值
  });

  it('應接受所有欄位', () => {
    const result = CreateCategorySchema.parse({
      ...validCategory,
      parentId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
      sortOrder: 5,
    });
    expect(result.parentId).toBe('clxxxxxxxxxxxxxxxxxxxxxxxxx');
    expect(result.sortOrder).toBe(5);
  });

  it('應拒絕空 name', () => {
    expect(() =>
      CreateCategorySchema.parse({ ...validCategory, name: '' })
    ).toThrow();
  });

  it('應拒絕超過 100 字的 name', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        name: 'a'.repeat(101),
      })
    ).toThrow();
  });

  it('應拒絕無效的 slug 格式', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        slug: 'Invalid Slug!',
      })
    ).toThrow();
  });

  it('應拒絕超過 100 字的 slug', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        slug: 'a'.repeat(101),
      })
    ).toThrow();
  });

  it('應拒絕非 CUID 的 parentId', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        parentId: 'invalid',
      })
    ).toThrow();
  });

  it('sortOrder 應拒絕負數', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        sortOrder: -1,
      })
    ).toThrow();
  });

  it('sortOrder 應拒絕浮點數', () => {
    expect(() =>
      CreateCategorySchema.parse({
        ...validCategory,
        sortOrder: 1.5,
      })
    ).toThrow();
  });
});

describe('UpdateCategorySchema', () => {
  it('應接受空物件', () => {
    const result = UpdateCategorySchema.parse({});
    // sortOrder 有 default(0)，partial() 後仍會套用預設值
    expect(result).toEqual({ sortOrder: 0 });
  });

  it('應接受部分欄位', () => {
    const result = UpdateCategorySchema.parse({ name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('應對提供的欄位進行驗證', () => {
    expect(() => UpdateCategorySchema.parse({ name: '' })).toThrow();
  });
});

describe('CreateTagSchema', () => {
  const validTag = {
    name: 'JavaScript',
    slug: 'javascript',
  };

  it('應接受合法標籤', () => {
    const result = CreateTagSchema.parse(validTag);
    expect(result.name).toBe('JavaScript');
    expect(result.slug).toBe('javascript');
  });

  it('應拒絕空 name', () => {
    expect(() =>
      CreateTagSchema.parse({ ...validTag, name: '' })
    ).toThrow();
  });

  it('應拒絕超過 50 字的 name', () => {
    expect(() =>
      CreateTagSchema.parse({ ...validTag, name: 'a'.repeat(51) })
    ).toThrow();
  });

  it('應接受 50 字的 name', () => {
    const result = CreateTagSchema.parse({
      ...validTag,
      name: 'a'.repeat(50),
    });
    expect(result.name.length).toBe(50);
  });

  it('應拒絕無效的 slug 格式', () => {
    expect(() =>
      CreateTagSchema.parse({ ...validTag, slug: 'Invalid!' })
    ).toThrow();
  });

  it('應拒絕超過 50 字的 slug', () => {
    expect(() =>
      CreateTagSchema.parse({ ...validTag, slug: 'a'.repeat(51) })
    ).toThrow();
  });
});

describe('UpdateTagSchema', () => {
  it('應接受空物件', () => {
    const result = UpdateTagSchema.parse({});
    expect(result).toEqual({});
  });

  it('應接受部分欄位', () => {
    const result = UpdateTagSchema.parse({ name: 'TypeScript' });
    expect(result.name).toBe('TypeScript');
  });

  it('應對提供的欄位進行驗證', () => {
    expect(() => UpdateTagSchema.parse({ slug: 'BAD SLUG' })).toThrow();
  });
});

describe('MediaUploadSchema', () => {
  it('應接受合法的 JPEG', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/jpeg',
      size: 1024 * 1024,
    });
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('應接受合法的 JPG', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/jpg',
      size: 500,
    });
    expect(result.mimeType).toBe('image/jpg');
  });

  it('應接受合法的 PNG', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/png',
      size: 2 * 1024 * 1024,
    });
    expect(result.mimeType).toBe('image/png');
  });

  it('應接受合法的 GIF', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/gif',
      size: 100,
    });
    expect(result.mimeType).toBe('image/gif');
  });

  it('應接受合法的 WebP', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/webp',
      size: 5 * 1024 * 1024,
    });
    expect(result.mimeType).toBe('image/webp');
  });

  it('應拒絕不支援的 MIME type', () => {
    expect(() =>
      MediaUploadSchema.parse({ mimeType: 'image/svg+xml', size: 1024 })
    ).toThrow();
  });

  it('應拒絕非圖片的 MIME type', () => {
    expect(() =>
      MediaUploadSchema.parse({ mimeType: 'application/pdf', size: 1024 })
    ).toThrow();
  });

  it('應接受剛好 10 MB 的檔案', () => {
    const result = MediaUploadSchema.parse({
      mimeType: 'image/png',
      size: 10 * 1024 * 1024,
    });
    expect(result.size).toBe(10 * 1024 * 1024);
  });

  it('應拒絕超過 10 MB 的檔案', () => {
    expect(() =>
      MediaUploadSchema.parse({
        mimeType: 'image/png',
        size: 10 * 1024 * 1024 + 1,
      })
    ).toThrow();
  });

  it('應拒絕浮點數的 size', () => {
    expect(() =>
      MediaUploadSchema.parse({ mimeType: 'image/png', size: 1024.5 })
    ).toThrow();
  });
});
