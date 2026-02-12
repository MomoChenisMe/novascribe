import { render, screen } from '@testing-library/react';
import Breadcrumb from '../Breadcrumb';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Breadcrumb', () => {
  it('應該渲染首頁連結', () => {
    const items = [{ label: '首頁', href: '/' }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('首頁')).toBeInTheDocument();
  });

  it('應該渲染麵包屑路徑', () => {
    const items = [
      { label: '首頁', href: '/' },
      { label: '分類', href: '/categories' },
      { label: '前端開發', href: '/categories/frontend' },
    ];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.getByText('分類')).toBeInTheDocument();
    expect(screen.getByText('前端開發')).toBeInTheDocument();
  });

  it('應該在項目之間顯示分隔符', () => {
    const items = [
      { label: '首頁', href: '/' },
      { label: '分類', href: '/categories' },
    ];
    render(<Breadcrumb items={items} />);
    // 使用 / 或 › 作為分隔符
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('最後一個項目不應該是連結', () => {
    const items = [
      { label: '首頁', href: '/' },
      { label: '前端開發', href: '/categories/frontend' },
      { label: 'React 入門指南' },
    ];
    render(<Breadcrumb items={items} />);
    
    const lastItem = screen.getByText('React 入門指南');
    expect(lastItem.closest('a')).toBeNull();
  });

  it('非最後項目應該是連結', () => {
    const items = [
      { label: '首頁', href: '/' },
      { label: '分類', href: '/categories' },
      { label: '前端開發' },
    ];
    render(<Breadcrumb items={items} />);
    
    const homeLink = screen.getByText('首頁').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    
    const categoryLink = screen.getByText('分類').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/categories');
  });

  it('應該使用 semantic HTML nav 標籤', () => {
    const items = [{ label: '首頁', href: '/' }];
    const { container } = render(<Breadcrumb items={items} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('應該有 aria-label', () => {
    const items = [{ label: '首頁', href: '/' }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByLabelText('麵包屑導航')).toBeInTheDocument();
  });

  it('空列表時不應該渲染任何內容', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.querySelector('nav')).toBeEmptyDOMElement();
  });

  it('單一項目時應該渲染但無分隔符', () => {
    const items = [{ label: '首頁', href: '/' }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.queryByText('/')).toBeNull();
  });
});
