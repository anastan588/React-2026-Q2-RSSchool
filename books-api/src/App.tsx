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

export const App = () => {
  const { searchQuery, storagePage, setSearchQuery, setStoragePage } = useSearchStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const urlPageStr = searchParams.get('page');
  const isInvalidPageParam = urlPageStr !== null && !/^\d+$/.test(urlPageStr);
  const currentPage = urlPageStr ? parseInt(urlPageStr, 10) : storagePage;

  const isDetailsPanelOpen = location.pathname.includes('/details/');

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

  const handleBookSelect = (bookId: string) => {
    const cleanedId = bookId.replace('/works/', '');
    const nextParams = new URLSearchParams(searchParams.toString());

    const pageParam = nextParams.get('page');
    if (pageParam === '1' || !pageParam) {
      nextParams.delete('page');
    }
    const targetUrl = `/details/${cleanedId}`;

    navigate(targetUrl);
  };

  const handleCloseDetails = () => {
    if (isDetailsPanelOpen) {
      navigate(urlPageStr ? `/?page=${urlPageStr}` : '/');
    }
  };

  if (isInvalidPageParam) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col" onClick={handleCloseDetails}>
      <header className="bg-slate-50 border-b border-zinc-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grow w-full">
            <SearchField initialValue={searchQuery} onSearch={handleSearch} />
          </div>
          <nav className="shrink-0 w-full sm:w-auto flex justify-end">
            <Link
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-zinc-200 rounded-xl shadow-xs transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-900 hover:border-zinc-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-98"
              to="/about"
            >
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  pathLength="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>About the App</span>
            </Link>
          </nav>
        </div>
      </header>
      <div className="grow flex w-full max-w-[1400px] mx-auto overflow-hidden relative">
        <main
          className={`grow transition-all duration-300 py-12 px-6 overflow-y-auto ${
            isDetailsPanelOpen ? 'w-1/2 lg:w-3/5 hidden md:block' : 'w-full'
          }`}
        >
          <div className="max-w-5xl mx-auto" onClick={(e) => e.stopPropagation()}>
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
                <BookList
                  books={books}
                  hasError={!!error}
                  onBookSelect={(book) => {
                    console.log('click');
                    handleBookSelect(book.id);
                  }}
                />
              </>
            )}
          </div>
        </main>

        {isDetailsPanelOpen ? (
          <aside className="w-full md:w-1/2 lg:w-2/5 h-[calc(100vh-80px)] sticky top-[80px] z-20 shrink-0">
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
