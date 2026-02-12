/**
 * @file 首頁元件測試
 * @description 測試首頁渲染 NovaScribe 標題。
 */

import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('首頁', () => {
  test('應渲染 NovaScribe 標題', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'NovaScribe',
    );
  });

  test('應有置中佈局', () => {
    const { container } = render(<Home />);

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
    );
  });
});
