/**
 * @file UI 元件 Accessibility 綜合測試
 * @description 使用 jest-axe 驗證所有 UI 元件符合 WCAG AA 標準
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';
import Card from './Card';
import Tag from './Tag';
import Input from './Input';
import Textarea from './Textarea';

expect.extend(toHaveNoViolations);

describe('UI 元件 Accessibility 綜合測試', () => {
  describe('Button 元件 WCAG AA 驗證', () => {
    test('所有 Button variants 應符合 WCAG AA 標準', async () => {
      const variants = ['primary', 'secondary', 'outline', 'icon'] as const;

      for (const variant of variants) {
        const { container } = render(
          <Button variant={variant} aria-label={variant === 'icon' ? 'Icon button' : undefined}>
            {variant !== 'icon' ? `${variant} Button` : <svg />}
          </Button>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    test('Button loading 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(<Button loading>Loading</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('Button disabled 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Card 元件 WCAG AA 驗證', () => {
    test('Card 基本用法應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card hover={true} 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Card hover={true}>
          <h3>Hoverable Card</h3>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card hover={false} 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Card hover={false}>
          <h3>Static Card</h3>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('可點擊 Card 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Card onClick={() => {}} role="button" tabIndex={0} aria-label="Read article">
          <h3>Clickable Card</h3>
          <p>Click to read more</p>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tag 元件 WCAG AA 驗證', () => {
    test('Tag 基本用法應符合 WCAG AA 標準', async () => {
      const { container } = render(<Tag>技術</Tag>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('可點擊 Tag 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Tag onClick={() => {}} role="button" tabIndex={0}>
          React
        </Tag>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('包含 aria-label 的 Tag 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Tag aria-label="Filter by TypeScript" role="button" tabIndex={0}>
          TypeScript
        </Tag>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input 元件 WCAG AA 驗證', () => {
    test('Input 基本用法應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Input label="使用者名稱" id="username" name="username" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input 包含錯誤訊息應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Input
          label="Email"
          id="email"
          name="email"
          error="請輸入有效的 Email"
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input required 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Input label="密碼" id="password" name="password" required />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input disabled 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Input label="唯讀欄位" id="readonly" name="readonly" disabled />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Textarea 元件 WCAG AA 驗證', () => {
    test('Textarea 基本用法應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Textarea label="文章內容" id="content" name="content" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Textarea 包含錯誤訊息應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Textarea
          label="備註"
          id="note"
          name="note"
          error="內容不得超過 500 字"
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Textarea required 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Textarea label="必填欄位" id="required" name="required" required />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Textarea disabled 狀態應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Textarea label="唯讀區域" id="readonly" name="readonly" disabled />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('元件組合 WCAG AA 驗證', () => {
    test('表單組合（Input + Button）應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <form>
          <Input label="Email" id="email" name="email" type="email" required />
          <Button type="submit">訂閱</Button>
        </form>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Card 包含 Tag 與 Button 應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <Card>
          <h3>文章標題</h3>
          <div>
            <Tag>技術</Tag>
            <Tag>前端</Tag>
          </div>
          <p>文章摘要內容...</p>
          <Button variant="outline">閱讀更多</Button>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('複雜表單（Input + Textarea + Button）應符合 WCAG AA 標準', async () => {
      const { container } = render(
        <form>
          <Input label="標題" id="title" name="title" required />
          <Textarea label="內容" id="content" name="content" required rows={5} />
          <div>
            <Tag>技術</Tag>
            <Tag>React</Tag>
          </div>
          <div>
            <Button variant="secondary">取消</Button>
            <Button type="submit">發布</Button>
          </div>
        </form>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // 注意：顏色對比測試需要實際的瀏覽器環境，jest-axe 在 jsdom 中無法正確執行顏色對比檢查
  // 顏色對比應在 E2E 測試或視覺回歸測試中驗證

  describe('鍵盤導航驗證', () => {
    test('所有可互動元件應可被存取', () => {
      const { container } = render(
        <div>
          <Button>Button</Button>
          <Input label="Input" id="input" name="input" />
          <Textarea label="Textarea" id="textarea" name="textarea" />
          <Tag onClick={() => {}} tabIndex={0} role="button">
            Tag
          </Tag>
        </div>,
      );

      const button = container.querySelector('button');
      const input = container.querySelector('input');
      const textarea = container.querySelector('textarea');
      const tag = container.querySelector('[role="button"]');

      expect(button).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'input');
      expect(textarea).toHaveAttribute('id', 'textarea');
      expect(tag).toHaveAttribute('tabIndex', '0');
    });
  });
});
