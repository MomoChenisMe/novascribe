/**
 * @file Markdown 編輯器元件測試
 * @description 測試 MarkdownEditor 元件
 *   - 編輯器渲染：textarea、工具列
 *   - 內容變更：onChange 回呼
 *   - 預覽切換：切換預覽模式顯示渲染後的內容
 *   - 工具列按鈕：加粗、斜體、標題、清單、連結
 *   - placeholder 與 height 設定
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

describe('MarkdownEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染', () => {
    it('應渲染編輯器', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('應顯示 placeholder', () => {
      render(
        <MarkdownEditor {...defaultProps} placeholder="請輸入內容..." />
      );
      expect(screen.getByPlaceholderText('請輸入內容...')).toBeInTheDocument();
    });

    it('應顯示初始值', () => {
      render(
        <MarkdownEditor {...defaultProps} value="# Hello World" />
      );
      expect(screen.getByRole('textbox')).toHaveValue('# Hello World');
    });

    it('應顯示工具列按鈕', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByTitle('粗體')).toBeInTheDocument();
      expect(screen.getByTitle('斜體')).toBeInTheDocument();
      expect(screen.getByTitle('標題')).toBeInTheDocument();
      expect(screen.getByTitle('清單')).toBeInTheDocument();
      expect(screen.getByTitle('連結')).toBeInTheDocument();
    });

    it('應顯示編輯/預覽切換按鈕', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByText('編輯')).toBeInTheDocument();
      expect(screen.getByText('預覽')).toBeInTheDocument();
    });
  });

  describe('內容變更', () => {
    it('輸入文字應觸發 onChange', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('預覽切換', () => {
    it('預設應顯示編輯模式', () => {
      render(<MarkdownEditor {...defaultProps} value="**bold**" />);
      expect(screen.getByRole('textbox')).toBeVisible();
    });

    it('點擊預覽按鈕應切換到預覽模式', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} value="**bold text**" />);

      await user.click(screen.getByText('預覽'));

      // 預覽模式中不應顯示 textarea
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      // 應顯示預覽區域
      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toBeInTheDocument();
    });

    it('點擊編輯按鈕應切換回編輯模式', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} value="# Title" />);

      // 先切換到預覽
      await user.click(screen.getByText('預覽'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      // 切換回編輯
      await user.click(screen.getByText('編輯'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('預覽模式應顯示空內容提示', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} value="" />);

      await user.click(screen.getByText('預覽'));

      expect(screen.getByText('尚無內容')).toBeInTheDocument();
    });
  });

  describe('工具列', () => {
    it('點擊粗體按鈕應插入粗體語法', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={onChange} />);

      await user.click(screen.getByTitle('粗體'));

      expect(onChange).toHaveBeenCalledWith('**粗體文字**');
    });

    it('點擊斜體按鈕應插入斜體語法', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={onChange} />);

      await user.click(screen.getByTitle('斜體'));

      expect(onChange).toHaveBeenCalledWith('*斜體文字*');
    });

    it('點擊標題按鈕應插入標題語法', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={onChange} />);

      await user.click(screen.getByTitle('標題'));

      expect(onChange).toHaveBeenCalledWith('## 標題');
    });

    it('點擊清單按鈕應插入清單語法', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={onChange} />);

      await user.click(screen.getByTitle('清單'));

      expect(onChange).toHaveBeenCalledWith('- 項目');
    });

    it('點擊連結按鈕應插入連結語法', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor value="" onChange={onChange} />);

      await user.click(screen.getByTitle('連結'));

      expect(onChange).toHaveBeenCalledWith('[連結文字](https://)');
    });
  });
});
