import './App.css';

import { Component } from 'react';

import BookList from '@/components/BookList';
import ErrorButton from '@/components/ErrorButton';
import ErrorMessage from '@/components/ErrorMessage';
import Loader from '@/components/Loader';
import SearchField from '@/components/SearchField';
import StorageService from '@/hooks/StorageHook';
import BookService from '@/services/BooksService';
import type { AppState } from '@/types/types';

class App extends Component<Record<string, never>, AppState> {
  private lastAppliedQuery: string = '';

  state: AppState = {
    query: StorageService.getSearchQuery(),
    books: [],
    isLoading: false,
    error: null,
  };

  componentDidMount(): void {
    const { query } = this.state;
    this.loadBooks(query);
  }

  handleSearch = (value: string): void => {
    const trimmed = value.trim();
    if (trimmed === this.lastAppliedQuery) return;
    this.setState({ query: trimmed }, () => {
      if (trimmed.length >= 3 || trimmed.length === 0) {
        StorageService.setSearchQuery(trimmed);
        this.loadBooks(trimmed);
      }
    });
  };

  private async loadBooks(query: string): Promise<void> {
    this.setState({ isLoading: true, error: null });
    this.lastAppliedQuery = query;
    try {
      const books = await BookService.searchBooks(query, { page: 1 });
      this.setState({ books, isLoading: false });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      this.setState({ error: errorMsg, isLoading: false, books: [] });
    }
  }

  render() {
    const { query, books, isLoading, error } = this.state;

    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-50 border-b border-zinc-200 py-6 px-6">
          <div className="max-w-5xl mx-auto">
            <SearchField initialValue={query} onSearch={this.handleSearch} />
          </div>
        </header>
        <main className="grow bg-white py-12 px-6">
          <div className="max-w-5xl mx-auto">
            {error && !isLoading ? <ErrorMessage message={error} onRetry={() => this.loadBooks(query)} /> : null}
            {isLoading ? <Loader query={query} /> : <BookList books={books} hasError={!!error} />}
          </div>
        </main>
        <footer className="py-10 bg-white border-t border-zinc-100 flex justify-center">
          <ErrorButton />
        </footer>
      </div>
    );
  }
}

export default App;
