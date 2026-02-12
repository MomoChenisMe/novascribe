/**
 * @file Tag 元件單元測試
 * @description 測試 Tag 元件 Hover 變色效果與 Accessibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Tag from './Tag';

expect.extend(toHaveNoViolations);

describe('Tag 元件', () => {
  describe('基本渲染測試', () => {
    test('應正確渲染標籤文字', () => {
      render(<Tag>技術</Tag>);

      expect(screen.getByText('技術')).toBeInTheDocument();
    });

    test('應有基礎樣式類別', () => {
      const { container } = render(<Tag>React</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('inline-flex', 'items-center');
      expect(tag).toHaveClass('px-3', 'py-1');
      expect(tag).toHaveClass('text-sm', 'font-medium');
      expect(tag).toHaveClass('rounded-full');
      expect(tag).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    test('應使用 span 標籤', () => {
      const { container } = render(<Tag>Test</Tag>);

      const tag = container.firstChild;
      expect(tag?.nodeName).toBe('SPAN');
    });
  });

  describe('Hover 變色測試（Stone 100 → Rose 50）', () => {
    test('預設應有 Stone 100 背景與 Stone 600 文字', () => {
      const { container } = render(<Tag>預設標籤</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('bg-stone-100', 'text-stone-600');
    });

    test('應有 Hover 變色樣式（Rose 50 背景 + Rose 600 文字）', () => {
      const { container } = render(<Tag>可 Hover 標籤</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('hover:bg-[var(--color-primary-light)]');
      expect(tag).toHaveClass('hover:text-[var(--color-primary)]');
      expect(tag).toHaveClass('cursor-pointer');
    });

    test('應有平滑過渡效果', () => {
      const { container } = render(<Tag>過渡標籤</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });
  });

  describe('Props 傳遞測試', () => {
    test('應支援自訂 className', () => {
      const { container } = render(
        <Tag className="custom-tag-class">自訂標籤</Tag>,
      );

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('custom-tag-class');
      // 應同時保留基礎樣式
      expect(tag).toHaveClass('bg-stone-100', 'text-stone-600', 'rounded-full');
    });

    test('應支援 onClick 事件', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Tag onClick={handleClick}>可點擊標籤</Tag>);

      const tag = screen.getByText('可點擊標籤');
      await user.click(tag);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應傳遞其他 HTML 屬性', () => {
      const { container } = render(
        <Tag data-testid="tech-tag" data-category="技術">
          技術
        </Tag>,
      );

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveAttribute('data-testid', 'tech-tag');
      expect(tag).toHaveAttribute('data-category', '技術');
    });

    test('應支援 aria-label 屬性', () => {
      const { container } = render(
        <Tag aria-label="Filter by React">React</Tag>,
      );

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveAttribute('aria-label', 'Filter by React');
    });

    test('應支援 role 屬性', () => {
      const { container } = render(<Tag role="button">可操作標籤</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveAttribute('role', 'button');
    });
  });

  describe('使用者互動測試', () => {
    test('點擊標籤應觸發 onClick 事件', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Tag onClick={handleClick}>React</Tag>);

      await user.click(screen.getByText('React'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應支援鍵盤導航（當有 onClick 時）', async () => {
      const handleClick = jest.fn();
      const handleKeyDown = jest.fn((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleClick();
        }
      });
      const user = userEvent.setup();

      render(
        <Tag onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button">
          TypeScript
        </Tag>,
      );

      const tag = screen.getByRole('button', { name: 'TypeScript' });
      tag.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('標籤應有 cursor-pointer 樣式', () => {
      const { container } = render(<Tag>Pointer Tag</Tag>);

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveClass('cursor-pointer');
    });

    test('多次點擊應多次觸發事件', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Tag onClick={handleClick}>Multi Click</Tag>);

      const tag = screen.getByText('Multi Click');
      await user.click(tag);
      await user.click(tag);
      await user.click(tag);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility 測試', () => {
    test('Tag 應符合 WCAG AA 標準 - 基本用法', async () => {
      const { container } = render(<Tag>前端開發</Tag>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Tag 應符合 WCAG AA 標準 - 包含 onClick', async () => {
      const { container } = render(
        <Tag onClick={() => {}} role="button" tabIndex={0}>
          可點擊標籤
        </Tag>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Tag 應符合 WCAG AA 標準 - 包含 aria-label', async () => {
      const { container } = render(
        <Tag aria-label="Filter posts by JavaScript" role="button" tabIndex={0}>
          JavaScript
        </Tag>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('可互動標籤應有適當的 role 屬性', () => {
      render(
        <Tag onClick={() => {}} role="button">
          互動標籤
        </Tag>,
      );

      const tag = screen.getByRole('button', { name: '互動標籤' });
      expect(tag).toBeInTheDocument();
    });

    test('可互動標籤應支援 tabIndex', () => {
      const { container } = render(
        <Tag onClick={() => {}} tabIndex={0} role="button">
          Focusable Tag
        </Tag>,
      );

      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('內容渲染測試', () => {
    test('應支援純文字內容', () => {
      render(<Tag>純文字標籤</Tag>);

      expect(screen.getByText('純文字標籤')).toBeInTheDocument();
    });

    test('應支援包含特殊字元的文字', () => {
      render(<Tag>#React & TypeScript</Tag>);

      expect(screen.getByText('#React & TypeScript')).toBeInTheDocument();
    });

    test('應支援 ReactNode 子元素', () => {
      render(
        <Tag>
          <span data-testid="icon">🏷️</span>
          <span>標籤文字</span>
        </Tag>,
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('標籤文字')).toBeInTheDocument();
    });

    test('應支援空格與換行', () => {
      render(<Tag>前端 開發</Tag>);

      expect(screen.getByText('前端 開發')).toBeInTheDocument();
    });
  });

  describe('樣式組合測試', () => {
    test('應正確組合所有預設樣式', () => {
      const { container } = render(<Tag>完整樣式</Tag>);

      const tag = container.firstChild as HTMLElement;

      // 佈局與間距
      expect(tag).toHaveClass('inline-flex', 'items-center', 'px-3', 'py-1');

      // 文字樣式
      expect(tag).toHaveClass('text-sm', 'font-medium');

      // 形狀
      expect(tag).toHaveClass('rounded-full');

      // 顏色
      expect(tag).toHaveClass('bg-stone-100', 'text-stone-600');

      // Hover 效果
      expect(tag).toHaveClass(
        'hover:bg-[var(--color-primary-light)]',
        'hover:text-[var(--color-primary)]',
      );

      // 過渡效果
      expect(tag).toHaveClass('transition-all', 'duration-200', 'ease-out');

      // 互動
      expect(tag).toHaveClass('cursor-pointer');
    });
  });
});
