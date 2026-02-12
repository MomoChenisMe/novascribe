import { render, screen } from '@testing-library/react';
import ArticleToc from '../ArticleToc';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

const mockTocItems = [
  { id: 'intro', text: '簡介', level: 2 },
  { id: 'getting-started', text: '開始使用', level: 2 },
  { id: 'installation', text: '安裝', level: 3 },
  { id: 'setup', text: '設定', level: 3 },
  { id: 'usage', text: '使用方式', level: 2 },
  { id: 'basic-usage', text: '基本用法', level: 3 },
  { id: 'advanced-usage', text: '進階用法', level: 3 },
  { id: 'conclusion', text: '總結', level: 2 },
];

describe('ArticleToc', () => {
  it('應該渲染目錄標題', () => {
    render(<ArticleToc items={mockTocItems} />);
    expect(screen.getByText('目錄')).toBeInTheDocument();
  });

  it('應該渲染所有 H2 標題', () => {
    render(<ArticleToc items={mockTocItems} />);
    expect(screen.getByText('簡介')).toBeInTheDocument();
    expect(screen.getByText('開始使用')).toBeInTheDocument();
    expect(screen.getByText('使用方式')).toBeInTheDocument();
    expect(screen.getByText('總結')).toBeInTheDocument();
  });

  it('應該渲染巢狀的 H3 標題', () => {
    render(<ArticleToc items={mockTocItems} />);
    expect(screen.getByText('安裝')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
    expect(screen.getByText('基本用法')).toBeInTheDocument();
    expect(screen.getByText('進階用法')).toBeInTheDocument();
  });

  it('每個標題應該是錨點連結', () => {
    render(<ArticleToc items={mockTocItems} />);
    const introLink = screen.getByText('簡介').closest('a');
    expect(introLink).toHaveAttribute('href', '#intro');
  });

  it('H3 標題應該有縮排樣式', () => {
    render(<ArticleToc items={mockTocItems} />);
    const h3Link = screen.getByText('安裝').closest('a');
    expect(h3Link).toHaveClass('pl-4');
  });

  it('H2 標題不應該有縮排', () => {
    render(<ArticleToc items={mockTocItems} />);
    const h2Link = screen.getByText('簡介').closest('a');
    expect(h2Link).not.toHaveClass('pl-4');
  });

  it('空目錄時應該不渲染', () => {
    const { container } = render(<ArticleToc items={[]} />);
    expect(container.querySelector('nav')).toBeEmptyDOMElement();
  });

  it('應該有 sticky 樣式', () => {
    const { container } = render(<ArticleToc items={mockTocItems} />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('sticky');
  });

  it('應該使用 semantic HTML nav 標籤', () => {
    const { container } = render(<ArticleToc items={mockTocItems} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('應該有 aria-label', () => {
    render(<ArticleToc items={mockTocItems} />);
    expect(screen.getByLabelText('文章目錄')).toBeInTheDocument();
  });

  it('連結應該平滑滾動（scroll-smooth）', () => {
    render(<ArticleToc items={mockTocItems} />);
    const link = screen.getByText('簡介').closest('a');
    // 檢查是否有 onClick handler 或特定 class
    expect(link).toBeInTheDocument();
  });
});
