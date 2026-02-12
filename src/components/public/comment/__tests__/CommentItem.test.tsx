/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CommentItem from '../CommentItem';

// Mock renderCommentMarkdown
jest.mock('@/lib/comment-markdown', () => ({
  renderCommentMarkdown: jest.fn(async (content: string) => {
    // 簡單模擬 Markdown 渲染
    return `<p>${content}</p>`;
  }),
}));

// Mock CommentForm
jest.mock('../CommentForm', () => {
  return function MockCommentForm() {
    return <div data-testid="comment-form">Mock Comment Form</div>;
  };
});

describe('CommentItem', () => {
  const mockComment = {
    id: 'comment-1',
    authorName: 'Momo Chen',
    authorEmail: 'momo@example.com',
    content: 'This is a **test** comment.',
    createdAt: new Date('2026-02-07T10:00:00Z'),
    status: 'APPROVED' as const,
    postId: 'post-1',
    parentId: null,
  };

  const mockOnReply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('頭像顯示', () => {
    it('應該顯示作者名稱首字母作為頭像', () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      
      const avatar = screen.getByText('M');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('aria-label', '作者頭像');
    });

    it('應該為英文名稱顯示首字母大寫', () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('應該為中文名稱顯示首字', () => {
      const chineseComment = { ...mockComment, authorName: '陳默默' };
      render(<CommentItem comment={chineseComment} onReply={mockOnReply} />);
      expect(screen.getByText('陳')).toBeInTheDocument();
    });

    it('應該正確處理空名稱（顯示 ?）', () => {
      const emptyNameComment = { ...mockComment, authorName: '' };
      render(<CommentItem comment={emptyNameComment} onReply={mockOnReply} />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('作者暱稱顯示', () => {
    it('應該顯示作者暱稱', () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      expect(screen.getByText('Momo Chen')).toBeInTheDocument();
    });
  });

  describe('相對時間顯示', () => {
    beforeEach(() => {
      // Mock current time: 2026-02-10T10:00:00Z (3 days after comment)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-10T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('應該顯示「3 天前」', () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      expect(screen.getByText('3 天前')).toBeInTheDocument();
    });

    it('應該顯示「剛剛」（少於 1 分鐘）', () => {
      const recentComment = {
        ...mockComment,
        createdAt: new Date('2026-02-10T09:59:30Z'),
      };
      render(<CommentItem comment={recentComment} onReply={mockOnReply} />);
      expect(screen.getByText('剛剛')).toBeInTheDocument();
    });

    it('應該顯示「5 分鐘前」', () => {
      const recentComment = {
        ...mockComment,
        createdAt: new Date('2026-02-10T09:55:00Z'),
      };
      render(<CommentItem comment={recentComment} onReply={mockOnReply} />);
      expect(screen.getByText('5 分鐘前')).toBeInTheDocument();
    });

    it('應該顯示「2 小時前」', () => {
      const recentComment = {
        ...mockComment,
        createdAt: new Date('2026-02-10T08:00:00Z'),
      };
      render(<CommentItem comment={recentComment} onReply={mockOnReply} />);
      expect(screen.getByText('2 小時前')).toBeInTheDocument();
    });

    it('應該顯示「30 天前」', () => {
      const oldComment = {
        ...mockComment,
        createdAt: new Date('2026-01-11T10:00:00Z'),
      };
      render(<CommentItem comment={oldComment} onReply={mockOnReply} />);
      expect(screen.getByText('30 天前')).toBeInTheDocument();
    });
  });

  describe('Markdown 內容渲染', () => {
    it('應該渲染 Markdown 內容為 HTML', async () => {
      const { container } = render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      
      // 等待 async renderCommentMarkdown 完成
      const contentDiv = container.querySelector('[data-testid="comment-content"]');
      expect(contentDiv).toBeInTheDocument();
      
      // 等待內容渲染完成
      await screen.findByText((_, element) => {
        return element?.getAttribute('data-testid') === 'comment-content' &&
               element.innerHTML.includes('<p>This is a **test** comment.</p>');
      });
    });

    it('應該使用 dangerouslySetInnerHTML 渲染 HTML', async () => {
      const { container } = render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      
      // 等待內容渲染完成
      await screen.findByText((_, element) => {
        return element?.getAttribute('data-testid') === 'comment-content' &&
               element.innerHTML.includes('<p>');
      });
      
      const contentDiv = container.querySelector('[data-testid="comment-content"]');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv?.innerHTML).toContain('<p>This is a **test** comment.</p>');
    });

    it('應該處理空內容', async () => {
      const emptyComment = { ...mockComment, content: '' };
      const { container } = render(<CommentItem comment={emptyComment} onReply={mockOnReply} />);
      
      // 等待渲染完成
      await screen.findByText('Momo Chen');
      
      // 等一小段時間讓 async effect 完成
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const contentDiv = container.querySelector('[data-testid="comment-content"]');
      expect(contentDiv?.innerHTML).toBe('<p></p>');
    });
  });

  describe('回覆按鈕', () => {
    it('應該顯示回覆按鈕', () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      expect(replyButton).toBeInTheDocument();
    });

    it('點擊回覆按鈕應該觸發 onReply callback（若有提供）', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);
      
      expect(mockOnReply).toHaveBeenCalledTimes(1);
      expect(mockOnReply).toHaveBeenCalledWith('comment-1');
    });

    it('未傳入 onReply 時仍應顯示回覆按鈕（用於展開 inline 表單）', () => {
      render(<CommentItem comment={mockComment} />);
      const replyButton = screen.queryByRole('button', { name: /回覆/i });
      expect(replyButton).toBeInTheDocument();
    });
  });

  describe('整體渲染結構', () => {
    it('應該包含所有必要元素', async () => {
      render(<CommentItem comment={mockComment} onReply={mockOnReply} />);
      
      // 頭像
      expect(screen.getByText('M')).toBeInTheDocument();
      // 作者名稱
      expect(screen.getByText('Momo Chen')).toBeInTheDocument();
      // 相對時間（fake timer 影響，實際顯示會是 2 天前）
      expect(screen.getByText(/天前/)).toBeInTheDocument();
      // 回覆按鈕
      expect(screen.getByRole('button', { name: /回覆/i })).toBeInTheDocument();
      // 內容（等待渲染）
      await screen.findByText((_, element) => {
        return element?.getAttribute('data-testid') === 'comment-content' &&
               element.innerHTML.includes('This is a **test** comment.');
      });
    });
  });
});
