import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterForm from '../NewsletterForm';

describe('NewsletterForm', () => {
  describe('渲染測試', () => {
    it('應該渲染預設標題', () => {
      render(<NewsletterForm />);
      expect(screen.getByText('訂閱電子報')).toBeInTheDocument();
    });

    it('應該渲染自訂標題', () => {
      render(<NewsletterForm title="訂閱我們的電子報" />);
      expect(screen.getByText('訂閱我們的電子報')).toBeInTheDocument();
    });

    it('應該渲染預設描述', () => {
      render(<NewsletterForm />);
      expect(screen.getByText('接收最新文章與科技新知,每週直送您的信箱')).toBeInTheDocument();
    });

    it('應該渲染自訂描述', () => {
      render(<NewsletterForm description="自訂描述文字" />);
      expect(screen.getByText('自訂描述文字')).toBeInTheDocument();
    });

    it('應該渲染 Email 輸入框', () => {
      render(<NewsletterForm />);
      const input = screen.getByPlaceholderText('your@email.com');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
    });

    it('應該渲染訂閱按鈕', () => {
      render(<NewsletterForm />);
      expect(screen.getByRole('button', { name: /訂閱/i })).toBeInTheDocument();
    });

    it('應該有 Rose 50 背景色', () => {
      render(<NewsletterForm />);
      const section = screen.getByTestId('newsletter-form-section');
      expect(section).toHaveClass('bg-rose-50');
    });

    it('標題應該有正確的樣式', () => {
      render(<NewsletterForm />);
      const title = screen.getByText('訂閱電子報');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-bold');
    });
  });

  describe('表單驗證', () => {
    it('空白 Email 應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.getByText('請輸入電子郵件地址')).toBeInTheDocument();
    });

    it('無效的 Email 格式應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'invalid-email');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
    });

    it('缺少 @ 符號應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'invalidemail.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
    });

    it('缺少域名應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
    });

    it('有效的 Email 不應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.queryByText('請輸入電子郵件地址')).not.toBeInTheDocument();
      expect(screen.queryByText('請輸入有效的電子郵件地址')).not.toBeInTheDocument();
    });

    it('輸入新內容時應該清除錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      expect(screen.getByText('請輸入電子郵件地址')).toBeInTheDocument();

      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'a');

      expect(screen.queryByText('請輸入電子郵件地址')).not.toBeInTheDocument();
    });
  });

  describe('表單提交', () => {
    it('提交有效 Email 後應該顯示成功訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('成功訊息應該包含 Checkmark icon', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      await waitFor(() => {
        const successMessage = screen.getByTestId('success-message');
        const svg = successMessage.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('成功訊息應該是綠色文字', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      await waitFor(() => {
        const successMessage = screen.getByTestId('success-message');
        expect(successMessage).toHaveClass('text-green-600');
      });
    });

    it('提交後應該清空輸入框', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com') as HTMLInputElement;
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('提交中應該禁用表單', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      // 檢查按鈕是否顯示 loading 狀態
      expect(screen.getByRole('button', { name: /訂閱中/i })).toBeInTheDocument();
    });

    it('提交後應該清除錯誤訊息', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      // 先觸發錯誤
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);
      expect(screen.getByText('請輸入電子郵件地址')).toBeInTheDocument();

      // 輸入有效 Email 並提交
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText('請輸入電子郵件地址')).not.toBeInTheDocument();
      });
    });
  });

  describe('無障礙性測試', () => {
    it('Email 輸入框應該有 aria-label', () => {
      render(<NewsletterForm />);
      const input = screen.getByPlaceholderText('your@email.com');
      expect(input).toHaveAttribute('aria-label', '電子郵件地址');
    });

    it('成功訊息應該有 role="alert"', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const input = screen.getByPlaceholderText('your@email.com');
      await user.type(input, 'test@example.com');
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      await waitFor(() => {
        const successMessage = screen.getByTestId('success-message');
        expect(successMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('錯誤訊息應該有 role="alert"', async () => {
      const user = userEvent.setup();
      render(<NewsletterForm />);
      
      const button = screen.getByRole('button', { name: /訂閱/i });
      await user.click(button);

      const errorMessage = screen.getByText('請輸入電子郵件地址');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('響應式佈局', () => {
    it('應該在行動裝置上垂直排列', () => {
      render(<NewsletterForm />);
      const form = screen.getByRole('form');
      const container = form.querySelector('.flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('sm:flex-row');
    });

    it('按鈕在行動裝置應該是全寬', () => {
      render(<NewsletterForm />);
      const button = screen.getByRole('button', { name: /訂閱/i });
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('sm:w-auto');
    });
  });
});
