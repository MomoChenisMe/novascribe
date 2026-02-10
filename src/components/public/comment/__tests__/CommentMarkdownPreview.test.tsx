import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentMarkdownPreview from '../CommentMarkdownPreview';

// Mock renderCommentMarkdown
jest.mock('@/lib/comment-markdown', () => ({
  renderCommentMarkdown: jest.fn(async (content: string | null) => {
    if (!content) return '';
    // 模擬簡單的 Markdown 渲染
    return `<p>${content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
  }),
}));

describe('CommentMarkdownPreview', () => {
  describe('Tab 切換', () => {
    it('應該預設顯示「編輯」tab', () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      const editTab = screen.getByRole('tab', { name: /編輯/i });
      expect(editTab).toHaveAttribute('aria-selected', 'true');
    });

    it('應該預設顯示 textarea', () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('點擊「預覽」tab 應該切換到預覽模式', async () => {
      render(<CommentMarkdownPreview content="測試內容" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(previewTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('點擊「預覽」tab 後應該隱藏 textarea', async () => {
      render(<CommentMarkdownPreview content="測試內容" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('切換到「預覽」後再切換回「編輯」應該顯示 textarea', async () => {
      render(<CommentMarkdownPreview content="測試內容" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      const editTab = screen.getByRole('tab', { name: /編輯/i });

      fireEvent.click(previewTab);
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });

      fireEvent.click(editTab);
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('編輯模式', () => {
    it('應該顯示 textarea 元素', () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('應該顯示目前的內容', () => {
      const content = '這是測試內容';
      render(<CommentMarkdownPreview content={content} onChange={jest.fn()} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(content);
    });

    it('輸入文字時應該呼叫 onChange', () => {
      const handleChange = jest.fn();
      render(<CommentMarkdownPreview content="" onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '新內容' } });

      expect(handleChange).toHaveBeenCalledWith('新內容');
    });

    it('應該支援多行輸入', () => {
      const multilineContent = '第一行\n第二行\n第三行';
      render(<CommentMarkdownPreview content={multilineContent} onChange={jest.fn()} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineContent);
    });
  });

  describe('預覽模式', () => {
    it('應該呼叫 renderCommentMarkdown 渲染內容', async () => {
      const { renderCommentMarkdown } = await import('@/lib/comment-markdown');
      
      render(<CommentMarkdownPreview content="**粗體**" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(renderCommentMarkdown).toHaveBeenCalledWith('**粗體**');
      });
    });

    it('應該顯示渲染後的 HTML', async () => {
      render(<CommentMarkdownPreview content="**粗體文字**" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(screen.getByText('粗體文字')).toBeInTheDocument();
      });
    });

    it('空內容應該顯示「尚無內容」提示', async () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(screen.getByText(/尚無內容/i)).toBeInTheDocument();
      });
    });

    it('null 內容應該顯示「尚無內容」提示', async () => {
      render(<CommentMarkdownPreview content={null as any} onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(screen.getByText(/尚無內容/i)).toBeInTheDocument();
      });
    });

    it('應該套用 prose 樣式', async () => {
      render(<CommentMarkdownPreview content="測試內容" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        const previewContent = screen.getByRole('tabpanel').querySelector('.prose');
        expect(previewContent).toBeInTheDocument();
      });
    });
  });

  describe('無障礙', () => {
    it('應該有正確的 ARIA 屬性', () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      const editTab = screen.getByRole('tab', { name: /編輯/i });
      const previewTab = screen.getByRole('tab', { name: /預覽/i });

      expect(editTab).toHaveAttribute('aria-selected', 'true');
      expect(previewTab).toHaveAttribute('aria-selected', 'false');
    });

    it('切換後應該更新 ARIA 屬性', async () => {
      render(<CommentMarkdownPreview content="測試" onChange={jest.fn()} />);
      
      const previewTab = screen.getByRole('tab', { name: /預覽/i });
      fireEvent.click(previewTab);

      await waitFor(() => {
        expect(previewTab).toHaveAttribute('aria-selected', 'true');
      });

      const editTab = screen.getByRole('tab', { name: /編輯/i });
      expect(editTab).toHaveAttribute('aria-selected', 'false');
    });

    it('應該有 tabpanel role', async () => {
      render(<CommentMarkdownPreview content="" onChange={jest.fn()} />);
      
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });
});
