/**
 * SearchBar 元件測試
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/public/common/SearchBar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SearchBar 元件', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('應該渲染搜尋輸入框', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    expect(input).toBeInTheDocument();
  });

  it('應該顯示搜尋按鈕或圖示', () => {
    render(<SearchBar />);
    
    const button = screen.getByRole('button', { name: /搜尋/i });
    expect(button).toBeInTheDocument();
  });

  it('應該在輸入時更新值', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Next.js' } });
    
    expect(input.value).toBe('Next.js');
  });

  it('應該在提交時導航至搜尋頁面', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    const form = input.closest('form')!;
    
    fireEvent.change(input, { target: { value: 'Next.js' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=Next.js');
    });
  });

  it('應該在空搜尋時不導航', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    const form = input.closest('form')!;
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('應該在按 Enter 時提交', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=test');
    });
  });

  it('應該自動 trim 搜尋關鍵字', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    const form = input.closest('form')!;
    
    fireEvent.change(input, { target: { value: '  Next.js  ' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=Next.js');
    });
  });

  it('應該支援 defaultValue prop', () => {
    render(<SearchBar defaultValue="initial search" />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i) as HTMLInputElement;
    expect(input.value).toBe('initial search');
  });

  it('應該支援自訂 placeholder', () => {
    render(<SearchBar placeholder="搜尋技術文章..." />);
    
    expect(screen.getByPlaceholderText('搜尋技術文章...')).toBeInTheDocument();
  });

  it('應該在輸入後顯示清除按鈕', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: /清除/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('點擊清除按鈕應該清空輸入', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/搜尋文章/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: /清除/i });
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });
});
