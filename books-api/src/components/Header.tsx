'use client'; // Обязательно, так как компонент содержит интерактивные элементы управления поиском и темой

import Link from 'next/link'; // ЗАМЕНЕНО с react-router

import SearchField from '@/components/SearchField';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  currentQuery: string;
  handleSearch: (query: string) => void;
}

export const Header = ({ currentQuery, handleSearch }: HeaderProps) => {
  return (
    <header className="bg-card/80 border-b border-border-custom py-6 px-6 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
        </div>

        <div className="grow w-full">
          <SearchField initialValue={currentQuery} onSearch={handleSearch} />
        </div>

        <nav className="shrink-0 w-full sm:w-auto flex justify-end">
          {/* ЗАМЕНЕНО: Свойство 'to' заменено на 'href' для Next.js */}
          <Link
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-400 ease-out active:scale-96 shadow-xs bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            href="/about"
          >
            <span>About the App</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
