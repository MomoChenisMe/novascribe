import { ReactNode } from 'react';
import { NavToggle } from '@/components/public/layout/NavToggle';
import { SideDrawer } from '@/components/public/layout/SideDrawer';
import { FooterBar } from '@/components/public/layout/FooterBar';

interface LayoutMinimalProps {
  children: ReactNode;
}

/**
 * LayoutMinimal — Swiss Style 極簡 Layout
 *
 * 無 Header Navbar，僅保留：
 * - NavToggle (左上角 Hamburger)
 * - SideDrawer (側邊導航面板)
 * - FooterBar (極簡 Footer + Widget System)
 */
export const LayoutMinimal = ({ children }: LayoutMinimalProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      {/* Navigation */}
      <NavToggle />
      <SideDrawer />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <FooterBar />
    </div>
  );
};
