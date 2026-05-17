import './App.css';

import { useEffect, useRef, useState } from 'react';

import BookList from '@/components/BookList';
import ErrorButton from '@/components/ErrorButton';
import ErrorMessage from '@/components/ErrorMessage';
import Loader from '@/components/Loader';
import SearchField from '@/components/SearchField';
import useSearchStorage from '@/hooks/StorageHook';
import { searchBooks } from '@/services/BooksService';
import type { Book } from '@/types/types';

export const App = () => {
  const { searchQuery, setSearchQuery } = useSearchStorage();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lastAppliedQuery = useRef<string>('');

  const loadBooks = async (query: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    lastAppliedQuery.current = query;

    try {
      const fetchedBooks = await searchBooks(query, { page: 1 });
      setBooks(fetchedBooks);
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      setIsLoading(false);
      setBooks([]);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadBooks(searchQuery);
    });
  }, []);

  const handleSearch = (value: string): void => {
    const trimmed = value.trim();
    if (trimmed === lastAppliedQuery.current) return;
    if (trimmed.length >= 3 || trimmed.length === 0) {
      setSearchQuery(trimmed);
      loadBooks(trimmed);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-50 border-b border-zinc-200 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <SearchField initialValue={searchQuery} onSearch={handleSearch} />
        </div>
      </header>
      <main className="grow bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {error && !isLoading ? <ErrorMessage message={error} onRetry={() => loadBooks(searchQuery)} /> : null}
          {isLoading ? <Loader query={searchQuery} /> : <BookList books={books} hasError={!!error} />}
        </div>
      </main>
      <footer className="py-10 bg-white border-t border-zinc-100 flex justify-center">
        <ErrorButton />
      </footer>
    </div>
  );
};

export default App;
