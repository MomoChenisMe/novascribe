'use client';

import { useDrawerStore } from '@/lib/store/drawer';

export const NavToggle = () => {
  const { toggle, isOpen } = useDrawerStore();

  return (
    <button
      onClick={toggle}
      className="fixed top-6 left-6 z-50 p-2 text-text-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 relative flex flex-col justify-center items-center gap-1.5">
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out transform ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out transform ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
    </button>
  );
};
