/**
 * 文章詳情頁評論區整合測試
 * 測試 CommentSection 是否正確渲染、postId 是否正確傳遞
 */

import { render, screen, waitFor } from '@testing-library/react';
import PostPage from '@/app/(public)/posts/[slug]/page';
import { getPostBySlug, getRelatedPosts } from '@/lib/services/public-post.service';

// Mock Next.js functions
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Mock services
jest.mock('@/lib/services/public-post.service', () => ({
  getPostBySlug: jest.fn(),
  getRelatedPosts: jest.fn(),
}));

// Mock markdown renderer
jest.mock('@/lib/markdown', () => ({
  renderMarkdown: jest.fn().mockResolvedValue('<p>渲染後的內容</p>'),
  extractToc: jest.fn().mockReturnValue([]),
}));

// Mock CommentSection
jest.mock('@/components/public/comment/CommentSection', () => {
  return function MockCommentSection({ postId }: { postId: string }) {
    return <div data-testid="comment-section" data-post-id={postId}>CommentSection</div>;
  };
});

// Mock other components
jest.mock('@/components/public/article/ArticleHeader', () => {
  return function MockArticleHeader() {
    return <div data-testid="article-header">ArticleHeader</div>;
  };
});

jest.mock('@/components/public/article/ArticleContent', () => {
  return function MockArticleContent() {
    return <div data-testid="article-content">ArticleContent</div>;
  };
});

jest.mock('@/components/public/article/ShareButtons', () => {
  return function MockShareButtons() {
    return <div data-testid="share-buttons">ShareButtons</div>;
  };
});

jest.mock('@/components/public/article/RelatedPosts', () => {
  return function MockRelatedPosts() {
    return <div data-testid="related-posts">RelatedPosts</div>;
  };
});

jest.mock('@/components/public/common/Breadcrumb', () => {
  return function MockBreadcrumb() {
    return <div data-testid="breadcrumb">Breadcrumb</div>;
  };
});

const mockPost = {
  id: 'post-123',
  title: 'React 入門指南',
  slug: 'react-intro',
  excerpt: '這是一篇介紹 React 基礎概念的文章',
  content: '# React 入門指南\n\nReact 是一個流行的前端框架...',
  featuredImage: '/images/react-intro.jpg',
  publishedAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  status: 'PUBLISHED',
  readingTime: 5,
  viewCount: 100,
  category: {
    id: 'cat1',
    name: '前端開發',
    slug: 'frontend',
  },
  tags: [],
  author: {
    id: 'author1',
    name: '張三',
    email: 'zhangsan@example.com',
  },
  seoMetadata: null,
};

describe('文章詳情頁評論區整合', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPostBySlug as jest.Mock).mockResolvedValue(mockPost);
    (getRelatedPosts as jest.Mock).mockResolvedValue([]);
  });

  it('應該在文章內容下方渲染 CommentSection', async () => {
    const PostPageElement = await PostPage({ params: { slug: 'react-intro' } });
    render(PostPageElement);

    await waitFor(() => {
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });
  });

  it('應該將正確的 postId 傳遞給 CommentSection', async () => {
    const PostPageElement = await PostPage({ params: { slug: 'react-intro' } });
    render(PostPageElement);

    await waitFor(() => {
      const commentSection = screen.getByTestId('comment-section');
      expect(commentSection).toHaveAttribute('data-post-id', 'post-123');
    });
  });

  it('CommentSection 應該在 ShareButtons 之後渲染', async () => {
    const PostPageElement = await PostPage({ params: { slug: 'react-intro' } });
    const { container } = render(PostPageElement);

    await waitFor(() => {
      const shareButtons = screen.getByTestId('share-buttons');
      const commentSection = screen.getByTestId('comment-section');

      // 檢查 DOM 順序
      const elements = Array.from(container.querySelectorAll('[data-testid]'));
      const shareIndex = elements.indexOf(shareButtons);
      const commentIndex = elements.indexOf(commentSection);

      expect(commentIndex).toBeGreaterThan(shareIndex);
    });
  });

  it('CommentSection 應該在 RelatedPosts 之前渲染（如果有相關文章）', async () => {
    (getRelatedPosts as jest.Mock).mockResolvedValue([
      { id: 'post2', title: '相關文章', slug: 'related-post' },
    ]);

    const PostPageElement = await PostPage({ params: { slug: 'react-intro' } });
    const { container } = render(PostPageElement);

    await waitFor(() => {
      const commentSection = screen.getByTestId('comment-section');
      const relatedPosts = screen.getByTestId('related-posts');

      // 檢查 DOM 順序
      const elements = Array.from(container.querySelectorAll('[data-testid]'));
      const commentIndex = elements.indexOf(commentSection);
      const relatedIndex = elements.indexOf(relatedPosts);

      expect(commentIndex).toBeLessThan(relatedIndex);
    });
  });

  it('文章不存在時不應該渲染 CommentSection', async () => {
    (getPostBySlug as jest.Mock).mockResolvedValue(null);
    const { notFound } = require('next/navigation');

    try {
      await PostPage({ params: { slug: 'not-exist' } });
    } catch (error: any) {
      // notFound() 會拋出錯誤
      expect(error.message).toBe('NEXT_NOT_FOUND');
    }

    expect(notFound).toHaveBeenCalled();
  });

  it('文章未發佈時不應該渲染 CommentSection', async () => {
    (getPostBySlug as jest.Mock).mockResolvedValue({
      ...mockPost,
      status: 'DRAFT',
    });
    const { notFound } = require('next/navigation');

    try {
      await PostPage({ params: { slug: 'react-intro' } });
    } catch (error: any) {
      // notFound() 會拋出錯誤
      expect(error.message).toBe('NEXT_NOT_FOUND');
    }

    expect(notFound).toHaveBeenCalled();
  });
});
