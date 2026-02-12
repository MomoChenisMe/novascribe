import { render, screen, fireEvent } from '@testing-library/react';
import { FooterBar } from '../layout/FooterBar';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe('Footer Widget System', () => {
  it('should render footer with copyright', () => {
    render(<FooterBar />);
    expect(screen.getByText(/NovaScribe. All rights reserved/)).toBeInTheDocument();
  });

  it('should render widget trigger links', () => {
    render(<FooterBar />);
    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
    expect(screen.getByText('Certifications')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('should open modal when widget link is clicked', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Disclaimer'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-label', 'Disclaimer');
  });

  it('should render RichText content in modal', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Disclaimer'));

    expect(screen.getByText(/本站所有文章內容/)).toBeInTheDocument();
  });

  it('should render ImageGrid content in modal', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Certifications'));

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it('should render LinkList content in modal', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Resources'));

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('RSS Feed')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Disclaimer'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close modal when backdrop is clicked', () => {
    render(<FooterBar />);
    fireEvent.click(screen.getByText('Disclaimer'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const backdrop = document.querySelector('[aria-hidden="true"].absolute.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });
});
