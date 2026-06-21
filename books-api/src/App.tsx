'use client';

import './App.css';

import React, { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import NotFound from '@/app/not-found';
import BookList from '@/components/BookList';
import ErrorButton from '@/components/ErrorButton';
import ErrorMessage from '@/components/ErrorMessage';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import Pagination from '@/components/Pangination';
import RefreshCacheButton from '@/components/RefreshCacheButton';
import SelectedBooksFlyout from '@/components/SelectedFlayout';
import useSearchStorage from '@/hooks/StorageHook';
import { booksApi, useSearchBooksQuery } from '@/services/BooksService';
import { useAppDispatch } from '@/state/store';
import type { Book } from '@/types/types';
import getErrorMessage from '@/utils/getErrorMessage';

interface AppProps {
  children?: React.ReactNode;
}

export const App: React.FC<AppProps> = ({ children }) => {
  const { searchQuery: initialQuery, storagePage, setSearchQuery, setStoragePage } = useSearchStorage();

  const router = useRouter();
  const rawPathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const safeParams = searchParams || new URLSearchParams();
  const pathname = rawPathname ?? '';
  const urlPageStr = safeParams.get('page');
  const urlQueryStr = safeParams.get('q');

  const isInvalidPageParam = urlPageStr !== null && !/^\d+$/.test(urlPageStr);
  const isDetailsPanelOpen = pathname.includes('/details/');

  const currentQuery = urlQueryStr !== null ? urlQueryStr : initialQuery;
  const currentPage = urlPageStr ? parseInt(urlPageStr, 10) : storagePage > 1 ? storagePage : 1;

  const { data, error, isLoading, isFetching, refetch } = useSearchBooksQuery({
    query: currentQuery,
    page: currentPage,
  });

  const books = data?.books ?? [];
  const totalPages = data?.totalPages ?? 1;

  const errorMessage = getErrorMessage(error);

  // Исправленный useEffect: исключает бесконечный цикл синхронизации параметров
  useEffect(() => {
    if (!pathname) return;

    const hasPage = safeParams.has('page');

    // Вычисляем строго строковые ожидаемые значения
    const expectedPage = hasPage ? safeParams.get('page') : storagePage > 1 ? String(storagePage) : '1';
    const expectedQuery = safeParams.get('q') ?? initialQuery ?? '';

    // Выполняем переход ТОЛЬКО если строка в URL физически отличается от расчетов
    if (urlPageStr !== expectedPage || urlQueryStr !== expectedQuery) {
      const nextParams = new URLSearchParams(safeParams.toString());

      if (expectedPage) nextParams.set('page', expectedPage);
      if (expectedQuery !== undefined) nextParams.set('q', expectedQuery);

      router.replace(`${pathname}?${nextParams.toString()}`);
    }
  }, [safeParams, storagePage, initialQuery, pathname, router, urlPageStr, urlQueryStr]);

  const handleSearch = useCallback(
    (value: string): void => {
      const trimmed = value.trim();
      if (trimmed === currentQuery) return;

      if (trimmed.length >= 3 || trimmed.length === 0) {
        const nextParams = new URLSearchParams(safeParams.toString());
        nextParams.set('q', trimmed);
        nextParams.set('page', '1');

        router.push(`${pathname}?${nextParams.toString()}`);

        setSearchQuery(trimmed);
        setStoragePage(1);
      }
    },
    [currentQuery, setSearchQuery, safeParams, pathname, router, setStoragePage],
  );

  const handleBookSelect = useCallback(
    (bookId: string) => {
      const cleanedId = bookId.replace('/works/', '');
      const currentSearch = safeParams.toString();
      const searchSuffix = currentSearch ? `?${currentSearch}` : '';
      router.push(`/details/${cleanedId}${searchSuffix}`);
    },
    [router, safeParams],
  );

  const handleCloseDetails = useCallback(() => {
    if (isDetailsPanelOpen) {
      const nextParams = new URLSearchParams();
      if (urlPageStr) nextParams.set('page', urlPageStr);
      nextParams.set('q', currentQuery);

      router.push(`/?${nextParams.toString()}`);
    }
  }, [isDetailsPanelOpen, router, urlPageStr, currentQuery]);

  const handleManualRefresh = (): void => {
    dispatch(booksApi.util.invalidateTags(['Books']));
  };

  if (isInvalidPageParam) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 relative">
      <SelectedBooksFlyout />
      <RefreshCacheButton isFetching={isFetching} onRefresh={handleManualRefresh} />
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <ErrorButton />
      </div>
      <Header currentQuery={currentQuery} handleSearch={handleSearch} />
      <div className="grow flex w-full max-w-[1400px] mx-auto relative">
        {isDetailsPanelOpen ? (
          <button
            aria-label="Close details"
            className="absolute inset-0 z-10 bg-black/5 dark:bg-black/20 backdrop-blur-xs block w-full h-full cursor-default transition-all duration-300 animate-in fade-in"
            type="button"
            onClick={handleCloseDetails}
          />
        ) : null}
        <main
          className={`grow transition-all duration-500 py-12 px-6 z-0 ${
            isDetailsPanelOpen ? 'w-1/2 lg:w-3/5 hidden md:block' : 'w-full'
          }`}
        >
          <div className="max-w-5xl mx-auto">
            {errorMessage && !isLoading && !isFetching ? (
              <ErrorMessage message={errorMessage} onRetry={refetch} />
            ) : null}
            {isLoading || isFetching ? (
              <Loader query={currentQuery} />
            ) : (
              !errorMessage &&
              books.length > 0 && (
                <div
                  className={`transition-opacity duration-300 ${
                    isFetching ? 'opacity-30 animate-pulse pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <div className="mb-8 flex justify-center">
                    <Pagination current={currentPage} total={totalPages} />
                  </div>
                  <BookList
                    books={books}
                    hasError={!!errorMessage}
                    onBookSelect={(book: Book) => handleBookSelect(book.id)}
                  />
                </div>
              )
            )}
          </div>
        </main>
        {isDetailsPanelOpen ? (
          <aside className="w-full md:w-1/2 lg:w-2/5 h-[calc(100vh-88px)] sticky top-[88px] z-20 shrink-0 border-l border-border-custom bg-card/90 backdrop-blur-xl transition-all duration-300 shadow-2xl animate-in slide-in-from-right duration-300">
            {children}
          </aside>
        ) : null}
      </div>
      <footer className="py-10 bg-card/40 border-t border-border-custom flex justify-center backdrop-blur-xs transition-colors duration-300" />
    </div>
  );
};

export default App;
