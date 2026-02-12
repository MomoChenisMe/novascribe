import { render, screen } from '@testing-library/react';
import ArticleContent from '../ArticleContent';

describe('ArticleContent', () => {
  it('應該渲染 HTML 內容', () => {
    const html = '<p>這是測試內容</p>';
    render(<ArticleContent html={html} />);
    expect(screen.getByText('這是測試內容')).toBeInTheDocument();
  });

  it('應該渲染標題', () => {
    const html = '<h2>測試標題</h2><p>內容</p>';
    render(<ArticleContent html={html} />);
    expect(screen.getByRole('heading', { name: '測試標題' })).toBeInTheDocument();
  });

  it('應該渲染程式碼區塊', () => {
    const html = '<pre><code class="language-javascript">const x = 1;</code></pre>';
    render(<ArticleContent html={html} />);
    expect(screen.getByText(/const x = 1;/)).toBeInTheDocument();
  });

  it('應該渲染連結', () => {
    const html = '<p><a href="https://example.com">測試連結</a></p>';
    render(<ArticleContent html={html} />);
    const link = screen.getByRole('link', { name: '測試連結' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('應該渲染圖片', () => {
    const html = '<img src="/test.jpg" alt="測試圖片" />';
    render(<ArticleContent html={html} />);
    const image = screen.getByAltText('測試圖片');
    expect(image).toBeInTheDocument();
  });

  it('應該渲染列表', () => {
    const html = '<ul><li>項目 1</li><li>項目 2</li></ul>';
    render(<ArticleContent html={html} />);
    expect(screen.getByText('項目 1')).toBeInTheDocument();
    expect(screen.getByText('項目 2')).toBeInTheDocument();
  });

  it('應該渲染表格', () => {
    const html = `
      <table>
        <thead>
          <tr><th>標題 1</th><th>標題 2</th></tr>
        </thead>
        <tbody>
          <tr><td>內容 1</td><td>內容 2</td></tr>
        </tbody>
      </table>
    `;
    render(<ArticleContent html={html} />);
    expect(screen.getByText('標題 1')).toBeInTheDocument();
    expect(screen.getByText('內容 1')).toBeInTheDocument();
  });

  it('應該渲染引用區塊', () => {
    const html = '<blockquote><p>這是引用內容</p></blockquote>';
    render(<ArticleContent html={html} />);
    expect(screen.getByText('這是引用內容')).toBeInTheDocument();
  });

  it('應該套用 prose 樣式類別', () => {
    const html = '<p>內容</p>';
    const { container } = render(<ArticleContent html={html} />);
    const article = container.querySelector('article');
    expect(article).toHaveClass('prose', 'prose-cjk');
  });

  it('應該套用 dark mode 樣式', () => {
    const html = '<p>內容</p>';
    const { container } = render(<ArticleContent html={html} />);
    const article = container.querySelector('article');
    expect(article).toHaveClass('dark:prose-invert');
  });

  it('應該正確處理 HTML 實體', () => {
    const html = '<p>&lt;script&gt;alert("test")&lt;/script&gt;</p>';
    render(<ArticleContent html={html} />);
    expect(screen.getByText('<script>alert("test")</script>')).toBeInTheDocument();
  });

  it('空內容時應該不渲染任何東西', () => {
    const { container } = render(<ArticleContent html="" />);
    const article = container.querySelector('article');
    expect(article?.textContent).toBe('');
  });

  it('應該使用 semantic HTML article 標籤', () => {
    const html = '<p>內容</p>';
    const { container } = render(<ArticleContent html={html} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
