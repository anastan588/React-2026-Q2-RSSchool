import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import BookList from '@/components/BookList';
import ErrorButton from '@/components/ErrorButton';
import ErrorMessage from '@/components/ErrorMessage';
import Loader from '@/components/Loader';
import Pagination from '@/components/Pangination';
import SearchField from '@/components/SearchField';
import useSearchStorage from '@/hooks/StorageHook';
import NotFound from '@/pages/NotFound';
import { searchBooks } from '@/services/BooksService';
import type { Book } from '@/types/types';

export const App = () => {
  const { searchQuery, storagePage, setSearchQuery, setStoragePage } = useSearchStorage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const urlPageStr = searchParams.get('page');
  const isInvalidPageParam = urlPageStr !== null && !/^\d+$/.test(urlPageStr);
  const currentPage = urlPageStr ? parseInt(urlPageStr, 10) : storagePage;

  const lastAppliedState = useRef<{ query: string; page: number }>({
    query: '',
    page: 0,
  });

  const loadBooks = useCallback(async (query: string, page: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    lastAppliedState.current = { query, page };

    try {
      const response = await searchBooks(query, { page });
      if (Array.isArray(response)) {
        setBooks(response);
        setTotalPages(Math.ceil(response.length / 10) || 1);
      } else {
        setBooks(response.books || []);
        setTotalPages(response.totalPages || 1);
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      setIsLoading(false);
      setBooks([]);
    }
  }, []);

  useEffect(() => {
    if (!searchParams.get('page') && storagePage > 1) {
      setSearchParams((prev) => {
        prev.set('page', String(storagePage));
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    if (searchQuery === lastAppliedState.current.query && currentPage === lastAppliedState.current.page) {
      return;
    }

    Promise.resolve().then(() => {
      loadBooks(searchQuery, currentPage);
    });
  }, [searchQuery, currentPage, loadBooks]);

  const handlePageChange = (newPage: number): void => {
    setStoragePage(newPage);
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  const handleSearch = (value: string): void => {
    const trimmed = value.trim();
    if (trimmed === lastAppliedState.current.query) return;

    if (trimmed.length >= 3 || trimmed.length === 0) {
      setSearchQuery(trimmed);
      setSearchParams((prev) => {
        prev.set('page', '1');
        return prev;
      });
    }
  };

  if (isInvalidPageParam) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-50 border-b border-zinc-200 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <SearchField initialValue={searchQuery} onSearch={handleSearch} />
        </div>
      </header>
      <main className="grow bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {error && !isLoading ? (
            <ErrorMessage message={error} onRetry={() => loadBooks(searchQuery, currentPage)} />
          ) : null}

          {isLoading ? (
            <Loader query={searchQuery} />
          ) : (
            <>
              {!error && books.length > 0 ? (
                <div className="mb-8 flex justify-center">
                  <Pagination current={currentPage} total={totalPages} onPageChange={handlePageChange} />
                </div>
              ) : null}
              <BookList books={books} hasError={!!error} />
            </>
          )}
        </div>
      </main>
      <footer className="py-10 bg-white border-t border-zinc-100 flex justify-center">
        <ErrorButton />
      </footer>
    </div>
  );
};

export default App;
