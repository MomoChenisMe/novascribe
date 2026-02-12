/**
 * @file 管理員回覆 UI 測試
 * @description 測試管理員回覆評論功能
 *   - 回覆按鈕顯示
 *   - 展開/收合回覆表單
 *   - 提交回覆（成功/失敗）
 *   - 回覆顯示在列表中
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AdminCommentReply } from '../AdminCommentReply';

// Mock fetch
global.fetch = jest.fn();

describe('AdminCommentReply', () => {
  const mockComment = {
    id: 'comment-1',
    content: 'Test comment',
    author: 'John Doe',
    status: 'APPROVED' as const,
  };

  const mockOnReplySuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('初始狀態', () => {
    it('應顯示「回覆」按鈕', () => {
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      expect(screen.getByRole('button', { name: /回覆/i })).toBeInTheDocument();
    });

    it('初始時不應顯示回覆表單', () => {
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /送出回覆/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('展開/收合回覆表單', () => {
    it('點擊「回覆」按鈕後應展開表單', async () => {
      const user = userEvent.setup();
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      await user.click(screen.getByRole('button', { name: /回覆/i }));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /送出回覆/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /取消/i })
      ).toBeInTheDocument();
    });

    it('點擊「取消」按鈕後應收合表單', async () => {
      const user = userEvent.setup();
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // 收合表單
      await user.click(screen.getByRole('button', { name: /取消/i }));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('收合表單時應清空輸入內容', async () => {
      const user = userEvent.setup();
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單並輸入內容
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '測試回覆內容');

      // 收合表單
      await user.click(screen.getByRole('button', { name: /取消/i }));

      // 重新展開表單
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('提交回覆', () => {
    it('成功提交回覆後應收合表單並顯示成功訊息', async () => {
      const user = userEvent.setup();
      const mockReply = {
        id: 'reply-1',
        content: '管理員回覆',
        author: 'Admin',
        createdAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockReply }),
      });

      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單並輸入內容
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      await user.type(screen.getByRole('textbox'), '管理員回覆');

      // 送出回覆
      await user.click(screen.getByRole('button', { name: /送出回覆/i }));

      // 等待 API 呼叫完成
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/comment-1/reply',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: '管理員回覆' }),
          })
        );
      });

      // 應該收合表單
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      // 應該顯示成功訊息
      expect(screen.getByText(/回覆成功/i)).toBeInTheDocument();

      // 應該呼叫 onReplySuccess
      expect(mockOnReplySuccess).toHaveBeenCalledWith(mockReply);
    });

    it('提交空白內容應顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單
      await user.click(screen.getByRole('button', { name: /回覆/i }));

      // 嘗試送出空白回覆
      await user.click(screen.getByRole('button', { name: /送出回覆/i }));

      // 應該顯示錯誤訊息
      expect(screen.getByText(/請輸入回覆內容/i)).toBeInTheDocument();

      // 不應該呼叫 API
      expect(global.fetch).not.toHaveBeenCalled();

      // 表單應該保持展開
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('API 回傳錯誤時應顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Internal server error' }),
      });

      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單並輸入內容
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      await user.type(screen.getByRole('textbox'), '測試回覆');

      // 送出回覆
      await user.click(screen.getByRole('button', { name: /送出回覆/i }));

      // 等待錯誤訊息顯示
      await waitFor(() => {
        expect(screen.getByText(/Internal server error/i)).toBeInTheDocument();
      });

      // 表單應該保持展開
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // 不應該呼叫 onReplySuccess
      expect(mockOnReplySuccess).not.toHaveBeenCalled();
    });

    it('提交中應禁用按鈕並顯示載入狀態', async () => {
      const user = userEvent.setup();
      // Mock 一個延遲的 API 回應
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, data: {} }),
                }),
              100
            )
          )
      );

      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單並輸入內容
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      await user.type(screen.getByRole('textbox'), '測試回覆');

      // 送出回覆
      const submitButton = screen.getByRole('button', { name: /送出回覆/i });
      await user.click(submitButton);

      // 提交中應禁用按鈕
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /取消/i })).toBeDisabled();
      expect(screen.getByRole('textbox')).toBeDisabled();

      // 應該顯示載入狀態
      expect(screen.getByText(/送出中/i)).toBeInTheDocument();

      // 等待提交完成
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('成功訊息自動消失', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('成功訊息應在 3 秒後自動消失', async () => {
      const user = userEvent.setup({ delay: null });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      render(
        <AdminCommentReply
          commentId={mockComment.id}
          onReplySuccess={mockOnReplySuccess}
        />
      );

      // 展開表單並提交
      await user.click(screen.getByRole('button', { name: /回覆/i }));
      await user.type(screen.getByRole('textbox'), '測試回覆');
      await user.click(screen.getByRole('button', { name: /送出回覆/i }));

      // 等待成功訊息顯示
      await waitFor(() => {
        expect(screen.getByText(/回覆成功/i)).toBeInTheDocument();
      });

      // 快進 3 秒
      jest.advanceTimersByTime(3000);

      // 成功訊息應該消失
      await waitFor(() => {
        expect(screen.queryByText(/回覆成功/i)).not.toBeInTheDocument();
      });
    });
  });
});
