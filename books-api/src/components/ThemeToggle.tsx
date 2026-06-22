'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('Theme');

  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <Button
      aria-label={isMounted ? t('aria', { nextTheme: t(nextTheme) }) : ''}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border backdrop-blur-md bg-card/60 border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      onClick={toggleTheme}
    >
      <span className="uppercase tracking-wider font-black text-current">
        {isMounted ? (theme === 'light' ? t('dark') : t('light')) : t('dark')}
      </span>
    </Button>
  );
};

export default ThemeToggle;
