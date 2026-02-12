/**
 * @file SeoPreview 元件 RTL 測試
 * @description 測試 Google 搜尋結果預覽元件
 *   - 模擬 Google 搜尋結果
 *   - 長文字截斷
 *   - 預設值顯示
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeoPreview } from '@/components/seo/SeoPreview';

describe('SeoPreview', () => {
  describe('正常顯示', () => {
    it('應顯示 meta title', () => {
      render(<SeoPreview title="測試標題" />);

      expect(screen.getByTestId('preview-title')).toHaveTextContent(
        '測試標題'
      );
    });

    it('應顯示 meta description', () => {
      render(<SeoPreview description="測試描述內容" />);

      expect(screen.getByTestId('preview-description')).toHaveTextContent(
        '測試描述內容'
      );
    });

    it('應顯示 URL', () => {
      render(<SeoPreview url="https://blog.example.com/posts/test" />);

      expect(screen.getByTestId('preview-url')).toHaveTextContent(
        'https://blog.example.com/posts/test'
      );
    });

    it('應顯示網站名稱', () => {
      render(<SeoPreview siteName="我的部落格" />);

      expect(screen.getByText(/我的部落格/)).toBeInTheDocument();
    });

    it('應有搜尋結果預覽的 aria-label', () => {
      render(<SeoPreview />);

      expect(
        screen.getByLabelText('Google 搜尋結果預覽')
      ).toBeInTheDocument();
    });
  });

  describe('長文字截斷', () => {
    it('標題超過 60 字元應截斷並加上省略號', () => {
      const longTitle = 'A'.repeat(65);
      render(<SeoPreview title={longTitle} />);

      const displayed = screen.getByTestId('preview-title').textContent;
      expect(displayed).toHaveLength(63); // 60 + '...'
      expect(displayed).toMatch(/\.\.\.$/);
    });

    it('標題 60 字元以內不應截斷', () => {
      const title = 'A'.repeat(60);
      render(<SeoPreview title={title} />);

      expect(screen.getByTestId('preview-title')).toHaveTextContent(title);
    });

    it('描述超過 160 字元應截斷並加上省略號', () => {
      const longDesc = 'B'.repeat(170);
      render(<SeoPreview description={longDesc} />);

      const displayed =
        screen.getByTestId('preview-description').textContent;
      expect(displayed).toHaveLength(163); // 160 + '...'
      expect(displayed).toMatch(/\.\.\.$/);
    });

    it('描述 160 字元以內不應截斷', () => {
      const desc = 'B'.repeat(160);
      render(<SeoPreview description={desc} />);

      expect(screen.getByTestId('preview-description')).toHaveTextContent(
        desc
      );
    });
  });

  describe('預設值顯示', () => {
    it('未設定標題時應顯示預設提示', () => {
      render(<SeoPreview />);

      expect(screen.getByTestId('preview-title')).toHaveTextContent(
        '未設定標題'
      );
    });

    it('未設定描述時應顯示預設提示', () => {
      render(<SeoPreview />);

      expect(screen.getByTestId('preview-description')).toHaveTextContent(
        '未設定描述'
      );
    });

    it('空字串標題應顯示預設提示', () => {
      render(<SeoPreview title="" />);

      expect(screen.getByTestId('preview-title')).toHaveTextContent(
        '未設定標題'
      );
    });

    it('空字串描述應顯示預設提示', () => {
      render(<SeoPreview description="" />);

      expect(screen.getByTestId('preview-description')).toHaveTextContent(
        '未設定描述'
      );
    });

    it('null 標題應顯示預設提示', () => {
      render(<SeoPreview title={null} />);

      expect(screen.getByTestId('preview-title')).toHaveTextContent(
        '未設定標題'
      );
    });

    it('預設 URL 應顯示 https://example.com', () => {
      render(<SeoPreview />);

      expect(screen.getByTestId('preview-url')).toHaveTextContent(
        'https://example.com'
      );
    });
  });
});
