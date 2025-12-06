'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};
