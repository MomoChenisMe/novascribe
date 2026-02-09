/**
 * @file SeoMetaForm 元件 RTL 測試
 * @description 測試 SEO Meta 編輯表單的 UI 互動
 *   - 表單渲染：所有欄位正確顯示
 *   - 欄位填寫：輸入值正確更新
 *   - 送出：呼叫 onSubmit 回呼
 *   - 驗證錯誤：顯示錯誤訊息
 *   - 字元計數器
 *   - 初始資料載入
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeoMetaForm, type SeoMetaData } from '@/components/seo/SeoMetaForm';

describe('SeoMetaForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue(undefined);
  });

  describe('表單渲染', () => {
    it('應渲染所有表單欄位', () => {
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      expect(screen.getByLabelText('Focus Keyword')).toBeInTheDocument();
      expect(screen.getByLabelText('Meta Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Meta Description')).toBeInTheDocument();
      expect(screen.getByLabelText('OG Title')).toBeInTheDocument();
      expect(screen.getByLabelText('OG Description')).toBeInTheDocument();
      expect(screen.getByLabelText('OG Image URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter Card 類型')).toBeInTheDocument();
      expect(screen.getByLabelText('Canonical URL')).toBeInTheDocument();
      expect(screen.getByText('noIndex')).toBeInTheDocument();
      expect(screen.getByText('noFollow')).toBeInTheDocument();
    });

    it('應渲染送出按鈕', () => {
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      expect(
        screen.getByRole('button', { name: '儲存 SEO 設定' })
      ).toBeInTheDocument();
    });

    it('loading 時應顯示「儲存中...」', () => {
      render(<SeoMetaForm onSubmit={mockSubmit} loading={true} />);

      const button = screen.getByRole('button', { name: '儲存中...' });
      expect(button).toBeDisabled();
    });

    it('應有 aria-label 表單標籤', () => {
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      expect(
        screen.getByRole('form', { name: 'SEO 設定表單' })
      ).toBeInTheDocument();
    });
  });

  describe('初始資料載入', () => {
    it('應載入初始資料', () => {
      const initialData: SeoMetaData = {
        metaTitle: '初始標題',
        metaDescription: '初始描述',
        focusKeyword: 'React',
        ogImage: 'https://example.com/og.jpg',
        noIndex: true,
        noFollow: false,
      };

      render(<SeoMetaForm onSubmit={mockSubmit} initialData={initialData} />);

      expect(screen.getByLabelText('Meta Title')).toHaveValue('初始標題');
      expect(screen.getByLabelText('Meta Description')).toHaveValue('初始描述');
      expect(screen.getByLabelText('Focus Keyword')).toHaveValue('React');
      expect(screen.getByLabelText('OG Image URL')).toHaveValue(
        'https://example.com/og.jpg'
      );
    });
  });

  describe('欄位填寫', () => {
    it('應能輸入 Meta Title', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const input = screen.getByLabelText('Meta Title');
      await user.type(input, '新標題');

      expect(input).toHaveValue('新標題');
    });

    it('應能輸入 Meta Description', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const textarea = screen.getByLabelText('Meta Description');
      await user.type(textarea, '新描述');

      expect(textarea).toHaveValue('新描述');
    });

    it('應能切換 noIndex', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const checkbox = screen.getByRole('checkbox', { name: /noIndex/i });
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('應能選擇 Twitter Card 類型', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const select = screen.getByLabelText('Twitter Card 類型');
      await user.selectOptions(select, 'summary');

      expect(select).toHaveValue('summary');
    });
  });

  describe('字元計數器', () => {
    it('Meta Title 應顯示字元計數', () => {
      render(
        <SeoMetaForm
          onSubmit={mockSubmit}
          initialData={{ metaTitle: 'ABC' }}
        />
      );

      expect(screen.getByText('3/70')).toBeInTheDocument();
    });

    it('Meta Description 應顯示字元計數', () => {
      render(
        <SeoMetaForm
          onSubmit={mockSubmit}
          initialData={{ metaDescription: 'ABCDE' }}
        />
      );

      expect(screen.getByText('5/160')).toBeInTheDocument();
    });
  });

  describe('送出', () => {
    it('應呼叫 onSubmit 回呼', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByLabelText('Meta Title');
      await user.type(titleInput, '測試標題');

      const button = screen.getByRole('button', { name: '儲存 SEO 設定' });
      await user.click(button);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          metaTitle: '測試標題',
        })
      );
    });
  });

  describe('驗證', () => {
    it('Canonical URL 無效時應顯示錯誤', async () => {
      const user = userEvent.setup();
      render(<SeoMetaForm onSubmit={mockSubmit} />);

      const input = screen.getByLabelText('Canonical URL');
      await user.type(input, 'not-a-url');

      const button = screen.getByRole('button', { name: '儲存 SEO 設定' });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText('Canonical URL 必須為有效 URL')
        ).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('外部錯誤應顯示', () => {
      render(
        <SeoMetaForm
          onSubmit={mockSubmit}
          errors={{ metaTitle: '標題已存在' }}
        />
      );

      expect(screen.getByText('標題已存在')).toBeInTheDocument();
    });
  });
});
