/**
 * @file Button 元件單元測試
 * @description 測試 Button 元件所有 variant 渲染、Loading 狀態與 Accessibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';

expect.extend(toHaveNoViolations);

describe('Button 元件', () => {
  describe('Variant 渲染測試', () => {
    test('應正確渲染 Primary variant', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: 'Primary Button' });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-[var(--color-primary)]', 'text-white');
      expect(button).toHaveClass('hover:bg-[var(--color-primary-hover)]');
    });

    test('應正確渲染 Secondary variant', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: 'Secondary Button' });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-stone-100', 'text-stone-900');
      expect(button).toHaveClass('hover:bg-stone-200');
    });

    test('應正確渲染 Outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button', { name: 'Outline Button' });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-transparent', 'text-stone-600');
      expect(button).toHaveClass('border', 'border-stone-300');
      expect(button).toHaveClass('hover:bg-stone-100');
    });

    test('應正確渲染 Icon variant', () => {
      render(
        <Button variant="icon" aria-label="Icon Button">
          <svg data-testid="icon" />
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Icon Button' });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-transparent', 'text-stone-600');
      expect(button).toHaveClass('hover:bg-stone-100');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    test('預設應使用 Primary variant', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: 'Default Button' });

      expect(button).toHaveClass('bg-[var(--color-primary)]', 'text-white');
    });
  });

  describe('Loading 狀態測試', () => {
    test('Loading 狀態應顯示 spinner 圖示', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      // 檢查 spinner SVG 是否存在
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('Loading 狀態應禁用按鈕', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    test('非 Loading 狀態應不顯示 spinner', () => {
      render(<Button loading={false}>Normal Button</Button>);
      const button = screen.getByRole('button');

      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).not.toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe('Props 傳遞測試', () => {
    test('應支援 disabled 屬性', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    test('應支援 onClick 事件', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: 'Click Me' });

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應支援自訂 className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-class');
    });

    test('應傳遞其他 HTML 屬性', () => {
      render(
        <Button type="submit" data-testid="submit-btn">
          Submit
        </Button>,
      );
      const button = screen.getByTestId('submit-btn');

      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('使用者互動測試', () => {
    test('點擊按鈕應觸發 active:scale-95 效果', () => {
      render(<Button>Interactive Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('active:scale-95');
    });

    test('Disabled 按鈕應不觸發 onClick', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>,
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('Loading 按鈕應不觸發 onClick', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={handleClick}>
          Loading Button
        </Button>,
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility 測試', () => {
    test('Button 應符合 WCAG AA 標準 - Primary variant', async () => {
      const { container } = render(<Button variant="primary">Accessible Button</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('Button 應符合 WCAG AA 標準 - Secondary variant', async () => {
      const { container } = render(<Button variant="secondary">Accessible Button</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('Button 應符合 WCAG AA 標準 - Outline variant', async () => {
      const { container } = render(<Button variant="outline">Accessible Button</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('Icon variant 應有適當的 aria-label', async () => {
      const { container } = render(
        <Button variant="icon" aria-label="Settings Icon">
          <svg />
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Settings Icon' });
      expect(button).toHaveAccessibleName('Settings Icon');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Disabled 狀態應可被 Screen Reader 識別', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });
  });
});
