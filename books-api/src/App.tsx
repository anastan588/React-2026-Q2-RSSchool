import './App.css';

import { useCallback, useEffect } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';

import BookList from '@/components/BookList';
import ErrorButton from '@/components/ErrorButton';
import ErrorMessage from '@/components/ErrorMessage';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import Pagination from '@/components/Pangination';
import RefreshCacheButton from '@/components/RefreshCacheButton';
import SelectedBooksFlyout from '@/components/SelectedFlayout';
import useSearchStorage from '@/hooks/StorageHook';
import NotFound from '@/pages/NotFound';
import { booksApi, useSearchBooksQuery } from '@/services/BooksService';
import { useAppDispatch } from '@/state/store';
import type { Book } from '@/types/types';

export const App: React.FC = () => {
  const { searchQuery: initialQuery, storagePage, setSearchQuery, setStoragePage } = useSearchStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const urlPageStr = searchParams.get('page');
  const urlQueryStr = searchParams.get('q');

  const isInvalidPageParam = urlPageStr !== null && !/^\d+$/.test(urlPageStr);
  const isDetailsPanelOpen = location.pathname.includes('/details/');

  const currentQuery = urlQueryStr !== null ? urlQueryStr : initialQuery;
  const currentPage = urlPageStr ? parseInt(urlPageStr, 10) : storagePage > 1 ? storagePage : 1;

  const { data, error, isLoading, isFetching, refetch } = useSearchBooksQuery({
    query: currentQuery,
    page: currentPage,
  });

  const books = data?.books ?? [];
  const totalPages = data?.totalPages ?? 1;

  const getErrorMessage = (): string | null => {
    if (!error) return null;

    if ('message' in error) {
      const err = error as SerializedError;
      return err.message ?? 'An unexpected error occurred';
    }

    if ('status' in error) {
      const err = error as FetchBaseQueryError;
      if (err.data && typeof err.data === 'object' && 'message' in err.data) {
        return String((err.data as Record<string, unknown>).message);
      }
    }

    return 'An unexpected error occurred';
  };

  const errorMessage = getErrorMessage();

  useEffect(() => {
    const hasPage = searchParams.has('page');
    const hasQuery = searchParams.has('q');
    if (!hasPage || !hasQuery) {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (!hasPage) {
        const fallbackPage = storagePage > 1 ? String(storagePage) : '1';
        nextParams.set('page', fallbackPage);
      }

      if (!hasQuery && initialQuery) {
        nextParams.set('q', initialQuery);
      }
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, storagePage, initialQuery, setSearchParams]);

  const handleSearch = useCallback(
    (value: string): void => {
      const trimmed = value.trim();
      if (trimmed === currentQuery) return;

      if (trimmed.length >= 3 || trimmed.length === 0) {
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev.toString());
          nextParams.set('q', trimmed);
          nextParams.set('page', '1');
          return nextParams;
        });
        setSearchQuery(trimmed);
        setStoragePage(1);
      }
    },
    [currentQuery, setSearchQuery, setSearchParams, setStoragePage],
  );

  const handleBookSelect = useCallback(
    (bookId: string) => {
      const cleanedId = bookId.replace('/works/', '');
      navigate(`/details/${cleanedId}${location.search}`);
    },
    [navigate, location.search],
  );

  const handleCloseDetails = useCallback(() => {
    if (isDetailsPanelOpen) {
      navigate(
        urlPageStr
          ? `/?page=${urlPageStr}&q=${encodeURIComponent(currentQuery)}`
          : `/?q=${encodeURIComponent(currentQuery)}`,
      );
    }
  }, [isDetailsPanelOpen, navigate, urlPageStr, currentQuery]);

  const handleManualRefresh = (): void => {
    // Явная очистка кэша заставляет стейт полностью обнулиться, гарантируя показ Loader
    dispatch(booksApi.util.invalidateTags(['Books', 'BookDetails']));
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
            {errorMessage && !isLoading ? <ErrorMessage message={errorMessage} onRetry={refetch} /> : null}

            {isLoading || isFetching ? (
              <Loader query={currentQuery} />
            ) : (
              <div
                className={`transition-opacity duration-300 ${
                  isFetching ? 'opacity-30 animate-pulse pointer-events-none' : 'opacity-100'
                }`}
              >
                {!errorMessage && books.length > 0 ? (
                  <div className="mb-8 flex justify-center">
                    <Pagination current={currentPage} total={totalPages} />
                  </div>
                ) : null}
                <BookList
                  books={books}
                  hasError={!!errorMessage}
                  onBookSelect={(book: Book) => handleBookSelect(book.id)}
                />
              </div>
            )}
          </div>
        </main>
        {isDetailsPanelOpen ? (
          <aside className="w-full md:w-1/2 lg:w-2/5 h-[calc(100vh-88px)] sticky top-[88px] z-20 shrink-0 border-l border-border-custom bg-card/90 backdrop-blur-xl transition-all duration-300 shadow-2xl animate-in slide-in-from-right duration-300">
            <Outlet />
          </aside>
        ) : null}
      </div>
      <footer className="py-10 bg-card/40 border-t border-border-custom flex justify-center backdrop-blur-xs transition-colors duration-300" />
    </div>
  );
};

export default App;
