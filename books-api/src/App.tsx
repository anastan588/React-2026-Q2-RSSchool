import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';

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

export const App: React.FC = () => {
  const { searchQuery: initialQuery, storagePage, setSearchQuery, setStoragePage } = useSearchStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const urlPageStr = searchParams.get('page');
  const urlQueryStr = searchParams.get('q');

  const isInvalidPageParam = urlPageStr !== null && !/^\d+$/.test(urlPageStr);
  const isDetailsPanelOpen = location.pathname.includes('/details/');

  const currentQuery = urlQueryStr !== null ? urlQueryStr : initialQuery;
  const currentPage = urlPageStr ? parseInt(urlPageStr, 10) : storagePage > 1 ? storagePage : 1;

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

      if (lastAppliedState.current.query !== query || lastAppliedState.current.page !== page) {
        return;
      }

      if (Array.isArray(response)) {
        setBooks(response);
        setTotalPages(Math.ceil(response.length / 10) || 1);
      } else {
        setBooks(response.books || []);
        setTotalPages(response.totalPages || 1);
      }
      setIsLoading(false);
    } catch (err: unknown) {
      if (lastAppliedState.current.query !== query || lastAppliedState.current.page !== page) {
        return;
      }
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      setIsLoading(false);
      setBooks([]);
    }
  }, []);

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

  useEffect(() => {
    if (currentQuery === lastAppliedState.current.query && currentPage === lastAppliedState.current.page) {
      return;
    }

    loadBooks(currentQuery, currentPage);
  }, [currentQuery, currentPage, loadBooks]);

  const handleSearch = useCallback(
    (value: string): void => {
      const trimmed = value.trim();
      if (trimmed === lastAppliedState.current.query) return;

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
    [setSearchQuery, setSearchParams, setStoragePage],
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

  if (isInvalidPageParam) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-50 border-b border-zinc-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grow w-full">
            <SearchField initialValue={currentQuery} onSearch={handleSearch} />
          </div>
          <nav className="shrink-0 w-full sm:w-auto flex justify-end">
            <Link
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-zinc-200 rounded-xl shadow-xs transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-900 hover:border-zinc-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-98"
              to="/about"
            >
              <span>About the App</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="grow flex w-full max-w-[1400px] mx-auto overflow-hidden relative">
        {isDetailsPanelOpen ? (
          <button
            aria-label="Close details"
            className="absolute inset-0 z-10 bg-transparent block w-full h-full cursor-default"
            type="button"
            onClick={handleCloseDetails}
          />
        ) : null}

        <main
          className={`grow transition-all duration-300 py-12 px-6 overflow-y-auto z-0 ${isDetailsPanelOpen ? 'w-1/2 lg:w-3/5 hidden md:block' : 'w-full'}`}
        >
          <div className="max-w-5xl mx-auto">
            {error && !isLoading ? (
              <ErrorMessage message={error} onRetry={() => loadBooks(currentQuery, currentPage)} />
            ) : null}

            {isLoading ? (
              <Loader query={currentQuery} />
            ) : (
              <>
                {!error && books.length > 0 ? (
                  <div className="mb-8 flex justify-center">
                    <Pagination current={currentPage} total={totalPages} />
                  </div>
                ) : null}
                <BookList books={books} hasError={!!error} onBookSelect={(book) => handleBookSelect(book.id)} />
              </>
            )}
          </div>
        </main>

        {isDetailsPanelOpen ? (
          <aside className="w-full md:w-1/2 lg:w-2/5 h-[calc(100vh-80px)] sticky top-[80px] z-20 shrink-0 border-l border-zinc-100 bg-white">
            <Outlet />
          </aside>
        ) : null}
      </div>

      <footer className="py-10 bg-white border-t border-zinc-100 flex justify-center">
        <ErrorButton />
      </footer>
    </div>
  );
};

export default App;
