import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NavToggle } from '../layout/NavToggle';
import { SideDrawer } from '../layout/SideDrawer';
import { FooterBar } from '../layout/FooterBar';
import { useDrawerStore } from '@/lib/store/drawer';

expect.extend(toHaveNoViolations);

// Mock Next.js
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe('Accessibility', () => {
  beforeEach(() => {
    useDrawerStore.setState({ isOpen: false });
    document.body.style.overflow = '';
  });

  describe('NavToggle', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<NavToggle />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria attributes', () => {
      render(<NavToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-expanded');
    });
  });

  describe('SideDrawer', () => {
    it('should have no accessibility violations when closed', async () => {
      const { container } = render(<SideDrawer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      render(<SideDrawer />);
      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should have aria-hidden attribute', () => {
      render(<SideDrawer />);
      const drawer = screen.getByRole('complementary', { hidden: true });
      expect(drawer).toHaveAttribute('aria-hidden', 'true');

      act(() => {
        useDrawerStore.setState({ isOpen: true });
      });
      expect(drawer).toHaveAttribute('aria-hidden', 'false');
    });

    it('should trap focus with ESC key support', () => {
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
    });
  });

  describe('FooterBar + WidgetModal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FooterBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should open modal with proper dialog role', () => {
      render(<FooterBar />);
      fireEvent.click(screen.getByText('Disclaimer'));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Disclaimer');
    });

    it('should have close button with aria-label', () => {
      render(<FooterBar />);
      fireEvent.click(screen.getByText('Disclaimer'));

      const closeBtn = screen.getByLabelText('Close');
      expect(closeBtn).toBeInTheDocument();
    });

    it('should close modal on ESC', () => {
      render(<FooterBar />);
      fireEvent.click(screen.getByText('Disclaimer'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
