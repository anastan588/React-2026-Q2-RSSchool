'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';

import type { Locale } from '@/i18n/config';

export const LanguageSwitcher = () => {
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      const fullPathname = window.location.pathname;
      const segments = fullPathname.split('/').filter(Boolean);

      if (segments[0] === currentLocale) {
        segments[0] = newLocale;
      } else {
        segments.unshift(newLocale);
      }

      const newPath = `/${segments.join('/')}${window.location.search}`;
      window.location.href = newPath;
    });
  };

  return (
    <div
      className={`flex items-center gap-1 bg-card/40 border border-border-custom p-1 rounded-xl text-xs font-bold transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <button
        className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${currentLocale === 'en' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-foreground'}`}
        type="button"
        onClick={() => handleLanguageChange('en')}
      >
        EN
      </button>
      <button
        className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${currentLocale === 'ru' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-foreground'}`}
        type="button"
        onClick={() => handleLanguageChange('ru')}
      >
        RU
      </button>
    </div>
  );
};

export default LanguageSwitcher;
