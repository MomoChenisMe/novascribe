/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CommentItem from '../CommentItem';

// Mock renderCommentMarkdown
jest.mock('@/lib/comment-markdown', () => ({
  renderCommentMarkdown: jest.fn(async (content: string) => {
    return `<p>${content}</p>`;
  }),
}));

// Mock CommentForm
jest.mock('../CommentForm', () => {
  return function MockCommentForm({
    postId,
    parentId,
    onSuccess,
    onCancel,
  }: {
    postId: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
  }) {
    return (
      <div data-testid="comment-form">
        <p>Comment Form</p>
        <p data-testid="form-postId">{postId}</p>
        {parentId && <p data-testid="form-parentId">{parentId}</p>}
        <button onClick={onSuccess} data-testid="mock-submit">
          Submit
        </button>
        <button onClick={onCancel} data-testid="mock-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

describe('CommentItem - 回覆功能', () => {
  const mockComment = {
    id: 'comment-1',
    authorName: 'Momo Chen',
    authorEmail: 'momo@example.com',
    content: 'This is a test comment.',
    createdAt: new Date('2026-02-07T10:00:00Z'),
    status: 'APPROVED' as const,
    postId: 'post-123',
    parentId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('點擊回覆按鈕', () => {
    it('應該展開 inline 表單', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 初始狀態不顯示表單
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();

      // 點擊回覆按鈕
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      // 應該顯示表單
      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });
    });

    it('應該隱藏回覆按鈕當表單展開時', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /回覆/i })).not.toBeInTheDocument();
      });
    });

    it('表單應該帶正確的 postId', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-postId')).toHaveTextContent('post-123');
      });
    });

    it('表單應該帶正確的 parentId', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-parentId')).toHaveTextContent('comment-1');
      });
    });
  });

  describe('取消回覆', () => {
    it('點擊取消按鈕應該收合表單', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 展開表單
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });

      // 點擊取消
      const cancelButton = screen.getByTestId('mock-cancel');
      await user.click(cancelButton);

      // 表單應該消失
      await waitFor(() => {
        expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      });
    });

    it('取消後應該重新顯示回覆按鈕', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 展開表單
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /回覆/i })).not.toBeInTheDocument();
      });

      // 點擊取消
      const cancelButton = screen.getByTestId('mock-cancel');
      await user.click(cancelButton);

      // 回覆按鈕應該重新出現
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /回覆/i })).toBeInTheDocument();
      });
    });
  });

  describe('提交回覆', () => {
    it('提交成功應該收合表單', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 展開表單
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });

      // 模擬提交成功
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);

      // 表單應該消失
      await waitFor(() => {
        expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      });
    });

    it('提交成功後應該重新顯示回覆按鈕', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 展開表單
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /回覆/i })).not.toBeInTheDocument();
      });

      // 模擬提交成功
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);

      // 回覆按鈕應該重新出現
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /回覆/i })).toBeInTheDocument();
      });
    });
  });

  describe('表單顯示與隱藏邏輯', () => {
    it('初始狀態不顯示表單', () => {
      render(<CommentItem comment={mockComment} />);
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    });

    it('只能同時顯示回覆按鈕或表單，不能同時顯示', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 初始狀態：顯示回覆按鈕，不顯示表單
      expect(screen.getByRole('button', { name: /回覆/i })).toBeInTheDocument();
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();

      // 點擊回覆後：不顯示回覆按鈕，顯示表單
      const replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /回覆/i })).not.toBeInTheDocument();
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });
    });

    it('可以多次開關表單', async () => {
      const user = userEvent.setup();
      render(<CommentItem comment={mockComment} />);

      // 第一次展開
      let replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);
      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });

      // 取消
      let cancelButton = screen.getByTestId('mock-cancel');
      await user.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      });

      // 第二次展開
      replyButton = screen.getByRole('button', { name: /回覆/i });
      await user.click(replyButton);
      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });

      // 提交成功
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      });
    });
  });
});
