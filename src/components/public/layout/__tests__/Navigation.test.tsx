import { render, screen, fireEvent, act } from '@testing-library/react';
import { SideDrawer } from '../SideDrawer';
import { NavToggle } from '../NavToggle';
import { useDrawerStore } from '@/lib/store/drawer';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Minimal Navigation System', () => {
  beforeEach(() => {
    useDrawerStore.setState({ isOpen: false });
    document.body.style.overflow = '';
  });

  describe('NavToggle', () => {
    it('should render hamburger button', () => {
      render(<NavToggle />);
      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should toggle drawer state when clicked', () => {
      render(<NavToggle />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(useDrawerStore.getState().isOpen).toBe(true);

      fireEvent.click(button);
      expect(useDrawerStore.getState().isOpen).toBe(false);
    });

    it('should update aria-label when open', () => {
      render(<NavToggle />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });
      const button = screen.getByRole('button', { name: /close menu/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('SideDrawer', () => {
    it('should be hidden by default', () => {
      render(<SideDrawer />);
      const drawer = screen.getByRole('complementary', { hidden: true });
      expect(drawer).toHaveClass('-translate-x-full');
      expect(drawer).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be visible when open', () => {
      render(<SideDrawer />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });
      const drawer = screen.getByRole('complementary');
      expect(drawer).toHaveClass('translate-x-0');
      expect(drawer).toHaveAttribute('aria-hidden', 'false');
    });

    it('should close when backdrop is clicked', () => {
      render(<SideDrawer />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });

      const backdrop = document.querySelector('[aria-hidden="true"].fixed.inset-0');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        fireEvent.click(backdrop);
        expect(useDrawerStore.getState().isOpen).toBe(false);
      }
    });

    it('should close when Escape key is pressed', () => {
      render(<SideDrawer />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(useDrawerStore.getState().isOpen).toBe(false);
    });

    it('should lock body scroll when open', () => {
      render(<SideDrawer />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });
      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        useDrawerStore.setState({ isOpen: false });
      });
      expect(document.body.style.overflow).toBe('');
    });

    it('should render navigation links', () => {
      render(<SideDrawer />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render user profile info', () => {
      render(<SideDrawer />);
      expect(screen.getByText('Momo Chen')).toBeInTheDocument();
      expect(screen.getByText(/AI Engineer/)).toBeInTheDocument();
    });
  });
});
