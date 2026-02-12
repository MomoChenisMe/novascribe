/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CommentForm from '../CommentForm';

// Mock global fetch
global.fetch = jest.fn();

describe('CommentForm', () => {
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    postId: 'post-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('欄位渲染', () => {
    it('應該渲染所有必要欄位', () => {
      render(<CommentForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/姓名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/電子郵件/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/評論內容/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /送出評論/i })).toBeInTheDocument();
    });

    it('應該包含隱藏的 honeypot 欄位', () => {
      const { container } = render(<CommentForm {...defaultProps} />);
      
      const honeypot = container.querySelector('input[name="website"]');
      expect(honeypot).toBeInTheDocument();
      expect(honeypot).toHaveAttribute('type', 'text');
      expect(honeypot).toHaveAttribute('tabindex', '-1');
      expect(honeypot).toHaveAttribute('autocomplete', 'off');
      
      // 檢查隱藏樣式
      const style = honeypot?.style;
      expect(style?.position).toBe('absolute');
      expect(style?.left).toBe('-9999px');
    });

    it('應該顯示 Markdown 提示文字', () => {
      render(<CommentForm {...defaultProps} />);
      expect(screen.getByText(/支援 Markdown 格式/i)).toBeInTheDocument();
    });

    it('回覆模式應該顯示 parentId（隱藏欄位）', () => {
      const { container } = render(<CommentForm {...defaultProps} parentId="parent-456" />);
      
      const parentIdInput = container.querySelector('input[name="parentId"]');
      expect(parentIdInput).toBeInTheDocument();
      expect(parentIdInput).toHaveAttribute('type', 'hidden');
      expect(parentIdInput).toHaveValue('parent-456');
    });
  });

  describe('Client-side 驗證', () => {
    it('應該要求姓名必填', async () => {
      const user = userEvent.setup();
      render(<CommentForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/請輸入姓名/i)).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('應該要求電子郵件必填', async () => {
      const user = userEvent.setup();
      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      await user.type(nameInput, 'Momo Chen');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/請輸入電子郵件/i)).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('應該驗證電子郵件格式', async () => {
      const user = userEvent.setup();
      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'invalid-email');
      await user.type(contentInput, 'Some content');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/請輸入有效的電子郵件格式/i)).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('應該要求評論內容必填', async () => {
      const user = userEvent.setup();
      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/請輸入評論內容/i)).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('通過驗證後應該清除錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<CommentForm {...defaultProps} />);
      
      // 先觸發驗證錯誤
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/請輸入姓名/i)).toBeInTheDocument();
      });
      
      // 填寫欄位
      const nameInput = screen.getByLabelText(/姓名/i);
      await user.type(nameInput, 'Momo Chen');
      
      // 錯誤訊息應該清除
      await waitFor(() => {
        expect(screen.queryByText(/請輸入姓名/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Honeypot 隱藏欄位', () => {
    it('honeypot 欄位應該預設為空', () => {
      const { container } = render(<CommentForm {...defaultProps} />);
      const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement;
      expect(honeypot?.value).toBe('');
    });

    it('honeypot 欄位應該不可見（使用者無法操作）', () => {
      const { container } = render(<CommentForm {...defaultProps} />);
      const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement;
      
      // 檢查 tabindex=-1（無法 Tab 到）
      expect(honeypot).toHaveAttribute('tabindex', '-1');
      // 檢查 autocomplete=off（瀏覽器不自動填入）
      expect(honeypot).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('提交成功', () => {
    it('應該成功提交評論並顯示成功訊息', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'comment-1',
          authorName: 'Momo Chen',
          authorEmail: 'momo@example.com',
          content: 'Test comment',
          createdAt: new Date().toISOString(),
          status: 'PENDING',
        }),
      });

      render(<CommentForm {...defaultProps} onSuccess={mockOnSuccess} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'This is a test comment.');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/posts/post-123/comments',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              authorName: 'Momo Chen',
              authorEmail: 'momo@example.com',
              content: 'This is a test comment.',
              honeypot: '',
            }),
          })
        );
      });
      
      await waitFor(() => {
        expect(screen.getByText(/評論已送出，待審核後顯示/i)).toBeInTheDocument();
      });
      
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('應該在成功後清空表單', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'comment-1' }),
      });

      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/電子郵件/i) as HTMLInputElement;
      const contentInput = screen.getByLabelText(/評論內容/i) as HTMLTextAreaElement;
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Test content');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(contentInput.value).toBe('');
      });
    });

    it('回覆模式應該帶上 parentId', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'comment-reply-1' }),
      });

      render(<CommentForm {...defaultProps} parentId="parent-456" onSuccess={mockOnSuccess} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Reply comment');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/posts/post-123/comments',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
      
      // 檢查 body 包含 parentId（不檢查順序）
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.parentId).toBe('parent-456');
      expect(body.authorName).toBe('Momo Chen');
      expect(body.content).toBe('Reply comment');
    });
  });

  describe('提交失敗', () => {
    it('應該顯示 API 錯誤訊息', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Rate limit exceeded' }),
      });

      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Test comment');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
      });
      
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('應該處理網路錯誤', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Test comment');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/評論送出失敗，請稍後再試/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading 狀態', () => {
    it('提交時按鈕應該變為 disabled', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Test comment');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      // 提交中時按鈕應該 disabled
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/送出中/i);
      
      // 等待提交完成
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 200 });
    });

    it('提交時應該顯示 loading 文字', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(<CommentForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/姓名/i);
      const emailInput = screen.getByLabelText(/電子郵件/i);
      const contentInput = screen.getByLabelText(/評論內容/i);
      
      await user.type(nameInput, 'Momo Chen');
      await user.type(emailInput, 'momo@example.com');
      await user.type(contentInput, 'Test comment');
      
      const submitButton = screen.getByRole('button', { name: /送出評論/i });
      await user.click(submitButton);
      
      expect(screen.getByRole('button', { name: /送出中/i })).toBeInTheDocument();
    });
  });
});
