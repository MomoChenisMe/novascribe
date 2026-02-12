'use client';

import { useState } from 'react';
import { footerWidgets, type WidgetConfig } from '@/config/widgets';
import { WidgetModal } from '../widgets/WidgetModal';

export const FooterBar = () => {
  const [activeWidget, setActiveWidget] = useState<WidgetConfig | null>(null);

  return (
    <>
      <footer className="border-t border-border-light bg-bg-main">
        <div className="container-responsive py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} NovaScribe. All rights reserved.
            </p>

            {/* Widget Links */}
            <div className="flex items-center gap-4">
              {footerWidgets.map((widget) => (
                <button
                  key={widget.label}
                  onClick={() => setActiveWidget(widget)}
                  className="text-xs text-text-muted hover:text-primary transition-colors underline underline-offset-4"
                >
                  {widget.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <WidgetModal
        widget={activeWidget}
        isOpen={activeWidget !== null}
        onClose={() => setActiveWidget(null)}
      />
    </>
  );
};
