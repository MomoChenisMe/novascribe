/**
 * @file Email HTML 模板測試
 * @description 驗證 Email HTML 模板包含關鍵資訊
 */

import {
  newCommentTemplate,
  replyTemplate,
} from '@/lib/email-templates';

describe('Email HTML 模板', () => {
  describe('newCommentTemplate', () => {
    const mockComment = {
      id: 'comment-1',
      authorName: '測試評論者',
      content: '這是一則測試評論內容，用來驗證 Email 模板是否正常運作。',
    };

    const mockPost = {
      id: 'post-1',
      title: '測試文章標題',
      slug: 'test-post-slug',
    };

    const adminUrl = 'https://example.com/admin/comments/comment-1';

    it('應回傳包含文章標題的 HTML', () => {
      const html = newCommentTemplate(mockComment, mockPost, adminUrl);
      expect(html).toContain('測試文章標題');
    });

    it('應回傳包含評論者名稱的 HTML', () => {
      const html = newCommentTemplate(mockComment, mockPost, adminUrl);
      expect(html).toContain('測試評論者');
    });

    it('應回傳包含評論內容的 HTML', () => {
      const html = newCommentTemplate(mockComment, mockPost, adminUrl);
      expect(html).toContain('這是一則測試評論內容');
    });

    it('應回傳包含管理後台連結的 HTML', () => {
      const html = newCommentTemplate(mockComment, mockPost, adminUrl);
      expect(html).toContain(adminUrl);
    });

    it('應將長於 200 字的評論內容截斷', () => {
      const longComment = {
        ...mockComment,
        content: 'a'.repeat(250),
      };
      const html = newCommentTemplate(longComment, mockPost, adminUrl);
      expect(html).toContain('a'.repeat(200));
      expect(html).toContain('...');
      expect(html).not.toContain('a'.repeat(250));
    });

    it('應使用 table layout 確保郵件客戶端相容', () => {
      const html = newCommentTemplate(mockComment, mockPost, adminUrl);
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
    });
  });

  describe('replyTemplate', () => {
    const mockReply = {
      id: 'reply-1',
      authorName: '管理員',
      content: '謝謝您的評論，這是我的回覆。',
    };

    const mockParentComment = {
      id: 'comment-1',
      authorName: '原評論者',
      content: '這是原始評論內容。',
    };

    const mockPost = {
      id: 'post-1',
      title: '測試文章標題',
      slug: 'test-post-slug',
    };

    it('應回傳包含文章標題的 HTML', () => {
      const html = replyTemplate(mockReply, mockParentComment, mockPost);
      expect(html).toContain('測試文章標題');
    });

    it('應回傳包含回覆者名稱的 HTML', () => {
      const html = replyTemplate(mockReply, mockParentComment, mockPost);
      expect(html).toContain('管理員');
    });

    it('應回傳包含回覆內容的 HTML', () => {
      const html = replyTemplate(mockReply, mockParentComment, mockPost);
      expect(html).toContain('謝謝您的評論，這是我的回覆');
    });

    it('應回傳包含原評論內容的 HTML', () => {
      const html = replyTemplate(mockReply, mockParentComment, mockPost);
      expect(html).toContain('這是原始評論內容');
    });

    it('應將長於 200 字的回覆內容截斷', () => {
      const longReply = {
        ...mockReply,
        content: 'b'.repeat(250),
      };
      const html = replyTemplate(longReply, mockParentComment, mockPost);
      expect(html).toContain('b'.repeat(200));
      expect(html).toContain('...');
      expect(html).not.toContain('b'.repeat(250));
    });

    it('應使用 table layout 確保郵件客戶端相容', () => {
      const html = replyTemplate(mockReply, mockParentComment, mockPost);
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
    });
  });
});
