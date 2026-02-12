/**
 * @file CommentBatchActions 組件測試
 * @description 測試批次操作功能（checkbox 勾選、批次按鈕、確認對話框、操作結果提示）
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentBatchActions from '../CommentBatchActions';

// Mock fetch
global.fetch = jest.fn();

describe('CommentBatchActions', () => {
  const mockComments = [
    {
      id: '1',
      content: '測試評論 1',
      author: '作者 1',
      status: 'PENDING',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      content: '測試評論 2',
      author: '作者 2',
      status: 'PENDING',
      createdAt: '2025-01-02T00:00:00Z',
    },
    {
      id: '3',
      content: '測試評論 3',
      author: '作者 3',
      status: 'APPROVED',
      createdAt: '2025-01-03T00:00:00Z',
    },
  ];

  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Checkbox 勾選邏輯', () => {
    it('應該顯示每行的 checkbox', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 應該有 3 個評論的 checkbox + 1 個全選 checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);
    });

    it('應該能夠勾選單一評論', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('應該能夠取消勾選單一評論', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('全選 checkbox 應該勾選所有評論', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const selectAllCheckbox = screen.getByLabelText('全選');
      fireEvent.click(selectAllCheckbox);

      // 檢查所有評論都被勾選
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      const checkbox2 = screen.getByLabelText('選取 測試評論 2');
      const checkbox3 = screen.getByLabelText('選取 測試評論 3');

      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(checkbox3).toBeChecked();
    });

    it('全選 checkbox 應該取消所有勾選', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const selectAllCheckbox = screen.getByLabelText('全選');

      // 先全選
      fireEvent.click(selectAllCheckbox);
      expect(selectAllCheckbox).toBeChecked();

      // 再取消全選
      fireEvent.click(selectAllCheckbox);
      expect(selectAllCheckbox).not.toBeChecked();

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      const checkbox2 = screen.getByLabelText('選取 測試評論 2');
      const checkbox3 = screen.getByLabelText('選取 測試評論 3');

      expect(checkbox1).not.toBeChecked();
      expect(checkbox2).not.toBeChecked();
      expect(checkbox3).not.toBeChecked();
    });

    it('全選 checkbox 在部分選取時應該顯示為未勾選', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 只勾選一個
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const selectAllCheckbox = screen.getByLabelText('全選');
      expect(selectAllCheckbox).not.toBeChecked();
    });
  });

  describe('批次操作按鈕', () => {
    it('未選取評論時不應顯示批次操作按鈕', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.queryByText('批次核准')).not.toBeInTheDocument();
      expect(screen.queryByText('批次標記 Spam')).not.toBeInTheDocument();
      expect(screen.queryByText('批次刪除')).not.toBeInTheDocument();
    });

    it('選取評論後應顯示批次操作按鈕', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 勾選一個評論
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      // 應該顯示批次操作按鈕
      expect(screen.getByText('批次核准')).toBeInTheDocument();
      expect(screen.getByText('批次標記 Spam')).toBeInTheDocument();
      expect(screen.getByText('批次刪除')).toBeInTheDocument();
    });

    it('應該顯示已選取的數量', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 勾選兩個評論
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      const checkbox2 = screen.getByLabelText('選取 測試評論 2');
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);

      expect(screen.getByText('已選取 2 筆')).toBeInTheDocument();
    });
  });

  describe('確認對話框', () => {
    it('點擊批次核准應顯示確認對話框', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 勾選一個評論
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      // 點擊批次核准
      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      // 應該顯示確認對話框
      expect(screen.getByText(/確定要批次核准/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '確定' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });

    it('點擊批次標記 Spam 應顯示確認對話框', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const spamButton = screen.getByText('批次標記 Spam');
      fireEvent.click(spamButton);

      expect(screen.getByText(/確定要批次標記為 Spam/)).toBeInTheDocument();
    });

    it('點擊批次刪除應顯示確認對話框', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const deleteButton = screen.getByText('批次刪除');
      fireEvent.click(deleteButton);

      expect(screen.getByText(/確定要批次刪除/)).toBeInTheDocument();
    });

    it('點擊取消應關閉對話框', () => {
      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      const cancelButton = screen.getByRole('button', { name: '取消' });
      fireEvent.click(cancelButton);

      // 對話框應該關閉
      expect(screen.queryByText(/確定要批次核准/)).not.toBeInTheDocument();
    });
  });

  describe('API 呼叫與操作結果', () => {
    it('確認批次核准應呼叫 API 並成功', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 2 }),
      });

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      // 勾選兩個評論
      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      const checkbox2 = screen.getByLabelText('選取 測試評論 2');
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);

      // 點擊批次核准
      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      // 確認
      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      // 檢查 API 呼叫
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/batch',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ids: ['1', '2'],
              action: 'approve',
            }),
          })
        );
      });

      // 應該顯示成功訊息
      await waitFor(() => {
        expect(screen.getByText(/成功核准 2 則評論/)).toBeInTheDocument();
      });

      // 應該重新載入列表
      expect(mockOnRefresh).toHaveBeenCalled();

      // 應該清除勾選
      await waitFor(() => {
        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).not.toBeChecked();
      });
    });

    it('批次標記 Spam 應呼叫正確的 action', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 1 }),
      });

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const spamButton = screen.getByText('批次標記 Spam');
      fireEvent.click(spamButton);

      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/batch',
          expect.objectContaining({
            body: JSON.stringify({
              ids: ['1'],
              action: 'spam',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/成功標記 1 則評論為 Spam/)).toBeInTheDocument();
      });
    });

    it('批次刪除應呼叫正確的 action', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 1 }),
      });

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const deleteButton = screen.getByText('批次刪除');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/comments/batch',
          expect.objectContaining({
            body: JSON.stringify({
              ids: ['1'],
              action: 'delete',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/成功刪除 1 則評論/)).toBeInTheDocument();
      });
    });

    it('API 失敗時應顯示錯誤訊息', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Internal server error' }),
      });

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument();
      });

      // 失敗時不應重新載入列表
      expect(mockOnRefresh).not.toHaveBeenCalled();
    });

    it('網路錯誤時應顯示錯誤訊息', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/操作失敗/)).toBeInTheDocument();
      });
    });
  });

  describe('邊界情況', () => {
    it('沒有評論時應該正常顯示', () => {
      render(
        <CommentBatchActions comments={[]} onRefresh={mockOnRefresh} />
      );

      // 應該只有全選 checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);
    });

    it('成功訊息應該在幾秒後自動消失', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: 1 }),
      });

      render(
        <CommentBatchActions
          comments={mockComments}
          onRefresh={mockOnRefresh}
        />
      );

      const checkbox1 = screen.getByLabelText('選取 測試評論 1');
      fireEvent.click(checkbox1);

      const approveButton = screen.getByText('批次核准');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: '確定' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/成功核准/)).toBeInTheDocument();
      });

      // 3 秒後訊息應該消失
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/成功核准/)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
