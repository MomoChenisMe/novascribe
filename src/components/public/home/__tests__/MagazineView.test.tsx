import { render, screen } from '@testing-library/react';
import { FeaturedHero } from '../FeaturedHero';
import { VisualGrid } from '../VisualGrid';

// Mock Next.js
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, fill, priority, ...props }: { alt: string; src: string; fill?: boolean; priority?: boolean; [key: string]: unknown }) => (
    <img alt={alt} src={src} data-fill={fill ? 'true' : undefined} data-priority={priority ? 'true' : undefined} {...props} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockPost = {
  title: 'Test Article',
  excerpt: 'This is a test excerpt',
  coverImage: '/images/test.jpg',
  slug: 'test-article',
  publishedAt: '2026-02-12T00:00:00.000Z',
  category: { name: 'Tech', slug: 'tech' },
};

describe('FeaturedHero', () => {
  it('should render hero with post title and excerpt', () => {
    render(<FeaturedHero post={mockPost} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
  });

  it('should render category and date', () => {
    render(<FeaturedHero post={mockPost} />);
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('2026-02-12')).toBeInTheDocument();
  });

  it('should link to post page', () => {
    render(<FeaturedHero post={mockPost} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/posts/test-article');
  });
});

describe('VisualGrid', () => {
  const mockPosts = [
    { ...mockPost, slug: 'post-1', title: 'Post 1' },
    { ...mockPost, slug: 'post-2', title: 'Post 2' },
    { ...mockPost, slug: 'post-3', title: 'Post 3' },
  ];

  it('should render all posts in grid', () => {
    render(<VisualGrid posts={mockPosts} />);
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.getByText('Post 3')).toBeInTheDocument();
  });

  it('should have responsive grid classes', () => {
    const { container } = render(<VisualGrid posts={mockPosts} />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should show empty message when no posts', () => {
    render(<VisualGrid posts={[]} />);
    expect(screen.getByText('暫無更多文章')).toBeInTheDocument();
  });

  it('should link each card to its post', () => {
    render(<VisualGrid posts={mockPosts} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/posts/post-1');
    expect(links[1]).toHaveAttribute('href', '/posts/post-2');
    expect(links[2]).toHaveAttribute('href', '/posts/post-3');
  });
});
