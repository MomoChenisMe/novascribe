'use client';

import { useEffect, useCallback } from 'react';
import type { WidgetConfig } from '@/config/widgets';
import { RichTextWidget } from './RichTextWidget';
import { ImageGridWidget } from './ImageGridWidget';

interface WidgetModalProps {
  widget: WidgetConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetModal = ({ widget, isOpen, onClose }: WidgetModalProps) => {
  // ESC 關閉
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !widget) return null;

  const renderContent = () => {
    switch (widget.type) {
      case 'rich-text':
        return <RichTextWidget content={widget.content} />;
      case 'image-grid':
        return <ImageGridWidget images={widget.images} />;
      case 'link-list':
        return (
          <ul className="space-y-3">
            {widget.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-text-primary hover:text-primary transition-colors underline underline-offset-4"
                >
                  {link.label}
                  {link.external && (
                    <span className="ml-1 text-text-muted text-xs">↗</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={widget.label}
        className="relative z-10 bg-bg-card border border-border-light rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <h2 className="text-lg font-bold text-text-primary">{widget.label}</h2>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};
