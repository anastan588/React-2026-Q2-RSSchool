'use client';

import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchField from '@/components/SearchField';
import ThemeToggle from '@/components/ThemeToggle';
import { Link, usePathname } from '@/i18n/routing'; // Изменено: импортируем usePathname отсюда

interface HeaderProps {
  currentQuery: string;
  handleSearch: (query: string) => void;
}

export const Header = ({ currentQuery, handleSearch }: HeaderProps) => {
  const pathname = usePathname() ?? '';
  const t = useTranslations('Header');

  const isAboutPage = pathname === '/about';
  const isNotFoundPage = !isAboutPage && pathname !== '/' && !pathname.includes('/details/');
  const isStaticOrErrorPage = isAboutPage || isNotFoundPage;

  return (
    <header className="bg-card/80 border-b border-border-custom py-6 px-6 backdrop-blur-md sticky top-0 z-30 transition-all duration-300 w-full">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <div
          className={`grow w-full transition-all duration-300 ease-in-out ${
            isStaticOrErrorPage
              ? 'opacity-0 pointer-events-none max-w-0 max-h-0 sm:max-h-none overflow-hidden'
              : 'opacity-100 max-w-xl max-h-16'
          }`}
        >
          <SearchField initialValue={currentQuery} onSearch={handleSearch} />
        </div>

        <nav className="shrink-0 w-full sm:w-auto flex justify-end">
          <Link
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-400 ease-out active:scale-96 shadow-xs bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            href={isStaticOrErrorPage ? '/' : '/about'}
          >
            <span>{isStaticOrErrorPage ? t('back') : t('about')}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
