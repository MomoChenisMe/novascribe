/**
 * @file Card 元件單元測試
 * @description 測試 Card 元件 Hover 效果與 Accessibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Card from './Card';

expect.extend(toHaveNoViolations);

describe('Card 元件', () => {
  describe('基本渲染測試', () => {
    test('應正確渲染子元素', () => {
      render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>,
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('應有基礎樣式類別', () => {
      const { container } = render(
        <Card>
          <p>Content</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--color-bg-card)]');
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('shadow-sm');
      expect(card).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });
  });

  describe('Hover 效果測試', () => {
    test('預設應啟用 Hover 效果 (shadow-md + translate-y-1)', () => {
      const { container } = render(
        <Card>
          <p>Hover Card</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:-translate-y-1');
      expect(card).toHaveClass('cursor-pointer');
    });

    test('hover={true} 應啟用 Hover 效果', () => {
      const { container } = render(
        <Card hover={true}>
          <p>Hover Enabled</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:-translate-y-1');
      expect(card).toHaveClass('cursor-pointer');
    });

    test('hover={false} 應禁用 Hover 效果', () => {
      const { container } = render(
        <Card hover={false}>
          <p>No Hover</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('hover:shadow-md');
      expect(card).not.toHaveClass('hover:-translate-y-1');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Props 傳遞測試', () => {
    test('應支援自訂 className', () => {
      const { container } = render(
        <Card className="custom-card-class">
          <p>Content</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card-class');
      // 應同時保留基礎樣式
      expect(card).toHaveClass('bg-[var(--color-bg-card)]', 'rounded-2xl');
    });

    test('應支援 onClick 事件', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Card onClick={handleClick}>
          <p>Clickable Card</p>
        </Card>,
      );

      const card = screen.getByText('Clickable Card').parentElement!;
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應傳遞其他 HTML 屬性', () => {
      const { container } = render(
        <Card data-testid="test-card" role="article">
          <p>Content</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('data-testid', 'test-card');
      expect(card).toHaveAttribute('role', 'article');
    });

    test('應支援 aria-label 屬性', () => {
      const { container } = render(
        <Card aria-label="Article Card">
          <p>Content</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-label', 'Article Card');
    });
  });

  describe('使用者互動測試', () => {
    test('Hover 卡片應有 cursor-pointer', () => {
      const { container } = render(
        <Card hover={true}>
          <p>Hover Card</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });

    test('非 Hover 卡片應無 cursor-pointer', () => {
      const { container } = render(
        <Card hover={false}>
          <p>Static Card</p>
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('cursor-pointer');
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
        <Card onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button">
          <p>Keyboard Accessible Card</p>
        </Card>,
      );

      const card = screen.getByRole('button');
      card.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility 測試', () => {
    test('Card 應符合 WCAG AA 標準 - 基本用法', async () => {
      const { container } = render(
        <Card>
          <h3>Card Title</h3>
          <p>Card description</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card 應符合 WCAG AA 標準 - 包含 aria-label', async () => {
      const { container } = render(
        <Card aria-label="Featured Article">
          <h3>Article Title</h3>
          <p>Article content</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card 應符合 WCAG AA 標準 - 可點擊卡片', async () => {
      const { container } = render(
        <Card onClick={() => {}} role="button" tabIndex={0} aria-label="Click to read article">
          <h3>Clickable Article</h3>
          <p>Click to read more</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card 應符合 WCAG AA 標準 - hover={false}', async () => {
      const { container } = render(
        <Card hover={false}>
          <h3>Static Card</h3>
          <p>No hover effect</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('內容渲染測試', () => {
    test('應支援複雜子元素結構', () => {
      render(
        <Card>
          <header>
            <h3>Header</h3>
          </header>
          <main>
            <p>Main content</p>
          </main>
          <footer>
            <button>Action</button>
          </footer>
        </Card>,
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    test('應支援 ReactNode 作為子元素', () => {
      render(
        <Card>
          <div>
            <img src="/test.jpg" alt="Test" />
            <p>Image card</p>
          </div>
        </Card>,
      );

      expect(screen.getByAltText('Test')).toBeInTheDocument();
      expect(screen.getByText('Image card')).toBeInTheDocument();
    });
  });
});
