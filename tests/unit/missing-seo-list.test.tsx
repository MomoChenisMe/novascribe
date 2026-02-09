/**
 * @file MissingSeoList 元件 RTL 測試
 * @description 測試缺少 SEO 資料的文章清單元件
 *   - 清單渲染
 *   - 快速編輯連結
 *   - 缺少 title/description 標記
 *   - 全部完善時的訊息
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MissingSeoList,
  type MissingSeoPost,
} from '@/components/dashboard/MissingSeoList';

const mockPosts: MissingSeoPost[] = [
  {
    id: '1',
    title: 'Missing Both',
    slug: 'missing-both',
    hasTitle: false,
    hasDescription: false,
  },
  {
    id: '2',
    title: 'Missing Title Only',
    slug: 'missing-title',
    hasTitle: false,
    hasDescription: true,
  },
  {
    id: '3',
    title: 'Missing Description Only',
    slug: 'missing-desc',
    hasTitle: true,
    hasDescription: false,
  },
];

describe('MissingSeoList', () => {
  it('應渲染文章清單', () => {
    render(<MissingSeoList posts={mockPosts} />);

    expect(screen.getByTestId('missing-seo-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('missing-seo-item')).toHaveLength(3);
  });

  it('應顯示文章標題', () => {
    render(<MissingSeoList posts={mockPosts} />);

    expect(screen.getByText('Missing Both')).toBeInTheDocument();
    expect(screen.getByText('Missing Title Only')).toBeInTheDocument();
    expect(screen.getByText('Missing Description Only')).toBeInTheDocument();
  });

  it('應顯示文章總數', () => {
    render(<MissingSeoList posts={mockPosts} />);

    expect(screen.getByText(/3 篇/)).toBeInTheDocument();
  });

  it('缺少 title 時應顯示標記', () => {
    render(<MissingSeoList posts={mockPosts} />);

    const titleMarkers = screen.getAllByTestId('missing-title');
    expect(titleMarkers).toHaveLength(2); // Post 1 and Post 2
  });

  it('缺少 description 時應顯示標記', () => {
    render(<MissingSeoList posts={mockPosts} />);

    const descMarkers = screen.getAllByTestId('missing-description');
    expect(descMarkers).toHaveLength(2); // Post 1 and Post 3
  });

  it('應包含快速編輯連結', () => {
    render(<MissingSeoList posts={mockPosts} />);

    const editLinks = screen.getAllByTestId('edit-link');
    expect(editLinks).toHaveLength(3);
    expect(editLinks[0]).toHaveAttribute('href', '/admin/posts/1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/admin/posts/2/edit');
    expect(editLinks[2]).toHaveAttribute('href', '/admin/posts/3/edit');
  });

  it('全部完善時應顯示恭喜訊息', () => {
    render(<MissingSeoList posts={[]} />);

    expect(screen.getByTestId('all-complete')).toBeInTheDocument();
    expect(screen.getByText(/所有文章的 SEO 設定已完善/)).toBeInTheDocument();
  });

  it('全部完善時不應顯示清單', () => {
    render(<MissingSeoList posts={[]} />);

    expect(screen.queryByTestId('missing-seo-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('missing-seo-items')).not.toBeInTheDocument();
  });

  it('只有一篇文章時應正確顯示', () => {
    render(
      <MissingSeoList
        posts={[
          {
            id: '1',
            title: 'Single Post',
            slug: 'single',
            hasTitle: false,
            hasDescription: false,
          },
        ]}
      />
    );

    expect(screen.getAllByTestId('missing-seo-item')).toHaveLength(1);
    expect(screen.getByText(/1 篇/)).toBeInTheDocument();
  });

  it('有 title 但缺少 description 時只顯示 description 標記', () => {
    render(
      <MissingSeoList
        posts={[
          {
            id: '1',
            title: 'Has Title',
            slug: 'has-title',
            hasTitle: true,
            hasDescription: false,
          },
        ]}
      />
    );

    expect(screen.queryByTestId('missing-title')).not.toBeInTheDocument();
    expect(screen.getByTestId('missing-description')).toBeInTheDocument();
  });
});
