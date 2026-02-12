/**
 * @file CommentSingleActions 組件測試
 * @description 測試單則評論操作功能（核准、標記 spam、刪除按鈕、狀態即時更新）
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSingleActions from '../CommentSingleActions';

// Mock fetch
global.fetch = jest.fn();

describe('CommentSingleActions', () => {
  const mockComment = {
    id: '1',
    content: '這是一則測試評論',
    author: '測試作者',
    status: 'PENDING',
    createdAt: '2025-01-01T00:00:00Z',
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('操作按鈕顯示', () => {
    it('應該顯示核准按鈕', () => {
      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('核准')).toBeInTheDocument();
    });

    it('應該顯示標記 Spam 按鈕', () => {
      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Spam')).toBeInTheDocument();
    });

    it('應該顯示刪除按鈕', () => {
      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('刪除')).toBeInTheDocument();
    });
  });

  describe('核准操作', () => {
    it('點擊核准按鈕應呼叫 API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '1',
          content: '這是一則測試評論',
          author: '測試作者',
          status: 'APPROVED',
          createdAt: '2025-01-01T00:00:00Z',
        }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/1',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'APPROVED' }),
          })
        );
      });
    });

    it('核准成功應呼叫 onUpdate 並顯示成功訊息', async () => {
      const updatedComment = {
        id: '1',
        content: '這是一則測試評論',
        author: '測試作者',
        status: 'APPROVED',
        createdAt: '2025-01-01T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedComment,
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(updatedComment);
      });

      await waitFor(() => {
        expect(screen.getByText('已核准')).toBeInTheDocument();
      });
    });

    it('核准失敗應顯示錯誤訊息', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText(/操作失敗/)).toBeInTheDocument();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('標記 Spam 操作', () => {
    it('點擊 Spam 按鈕應呼叫 API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '1',
          content: '這是一則測試評論',
          author: '測試作者',
          status: 'SPAM',
          createdAt: '2025-01-01T00:00:00Z',
        }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const spamButton = screen.getByText('Spam');
      fireEvent.click(spamButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/1',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'SPAM' }),
          })
        );
      });
    });

    it('標記 Spam 成功應呼叫 onUpdate 並顯示成功訊息', async () => {
      const updatedComment = {
        id: '1',
        content: '這是一則測試評論',
        author: '測試作者',
        status: 'SPAM',
        createdAt: '2025-01-01T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedComment,
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const spamButton = screen.getByText('Spam');
      fireEvent.click(spamButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(updatedComment);
      });

      await waitFor(() => {
        expect(screen.getByText('已標記為 Spam')).toBeInTheDocument();
      });
    });
  });

  describe('刪除操作', () => {
    it('點擊刪除按鈕應呼叫 DELETE API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const deleteButton = screen.getByText('刪除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });

    it('刪除成功應呼叫 onUpdate 並顯示成功訊息', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const deleteButton = screen.getByText('刪除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(null);
      });

      await waitFor(() => {
        expect(screen.getByText('已刪除')).toBeInTheDocument();
      });
    });

    it('刪除失敗應顯示錯誤訊息', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Comment not found' }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const deleteButton = screen.getByText('刪除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/操作失敗/)).toBeInTheDocument();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('網路錯誤處理', () => {
    it('網路錯誤時應顯示錯誤訊息', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText(/操作失敗/)).toBeInTheDocument();
      });
    });
  });

  describe('按鈕狀態', () => {
    it('操作進行中時應禁用所有按鈕', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    id: '1',
                    content: '這是一則測試評論',
                    author: '測試作者',
                    status: 'APPROVED',
                    createdAt: '2025-01-01T00:00:00Z',
                  }),
                }),
              100
            )
          )
      );

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      // 按鈕應該被禁用
      expect(approveButton).toBeDisabled();
      expect(screen.getByText('Spam')).toBeDisabled();
      expect(screen.getByText('刪除')).toBeDisabled();

      // 等待操作完成
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('樂觀更新', () => {
    it('核准操作應立即更新 UI 狀態', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    id: '1',
                    content: '這是一則測試評論',
                    author: '測試作者',
                    status: 'APPROVED',
                    createdAt: '2025-01-01T00:00:00Z',
                  }),
                }),
              100
            )
          )
      );

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      // 應該立即顯示處理中狀態（按鈕禁用）
      expect(approveButton).toBeDisabled();

      // 等待操作完成
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('訊息自動消失', () => {
    it('成功訊息應該在 3 秒後自動消失', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '1',
          content: '這是一則測試評論',
          author: '測試作者',
          status: 'APPROVED',
          createdAt: '2025-01-01T00:00:00Z',
        }),
      });

      render(
        <CommentSingleActions comment={mockComment} onUpdate={mockOnUpdate} />
      );

      const approveButton = screen.getByText('核准');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('已核准')).toBeInTheDocument();
      });

      // 3 秒後訊息應該消失
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('已核准')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('已核准的評論', () => {
    it('已核准的評論應該顯示不同的按鈕狀態', () => {
      const approvedComment = {
        ...mockComment,
        status: 'APPROVED',
      };

      render(
        <CommentSingleActions
          comment={approvedComment}
          onUpdate={mockOnUpdate}
        />
      );

      // 核准按鈕應該仍然存在（可以重新核准）
      expect(screen.getByText('核准')).toBeInTheDocument();
    });
  });
});
