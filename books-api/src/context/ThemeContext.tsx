'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import type { Theme, ThemeContextType } from '@/types/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Инициализируем состояние лениво.
  // На сервере вернется 'light', в браузере — сразу актуальная тема из localStorage без лишних вызовов эффекта.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = localStorage.getItem('books-app-theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Этот эффект теперь занимается ТОЛЬКО синхронизацией состояния с внешним миром (DOM и хранилищем)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('books-app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
