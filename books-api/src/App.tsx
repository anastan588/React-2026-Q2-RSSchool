import './App.css';

import { Component } from 'react';

import BookList from './components/BookList';
import Button from './components/Button'; // Assuming you have this reusable component
import ErrorButton from './components/ErrorButton';
import SearchField from './components/SearchField';
import type { Book } from './services/BooksService';
import BookService from './services/BooksService';
import StorageService from './services/StorageService';

interface AppState {
  query: string;
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

class App extends Component<Record<string, never>, AppState> {
  private abortController: AbortController | null = null;

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
    this.setState({ query: value }, () => {
      const { query } = this.state;
      if (query.trim().length >= 3) {
        StorageService.setSearchQuery(query);
        this.loadBooks(query);
      }
    });
  };

  private async loadBooks(query: string): Promise<void> {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    this.setState({ isLoading: true, error: null });

    try {
      const books = await BookService.searchBooks(query, this.abortController.signal);
      this.setState({ books, isLoading: false });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;

      // Feature 8: Human-readable error message
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      this.setState({ error: errorMsg, isLoading: false, books: [] });
    }
  }

  render() {
    const { query, books, isLoading, error } = this.state;

    return (
      <main className="app-container">
        <SearchField initialValue={query} onSearch={this.handleSearch} />
        {error && !isLoading ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-8 rounded-3xl text-center mb-8 animate-in fade-in">
            <p className="text-xs uppercase tracking-widest font-bold mb-2 opacity-60">Service Alert</p>
            <p className="mb-6 font-medium">{error}</p>
            <Button
              className="!bg-red-600 !shadow-red-600/20 !px-6 !py-2 text-sm"
              onClick={() => this.loadBooks(query)}
            >
              Retry Search
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-lg">Searching for &quot;{query || 'popular books'}&quot;...</p>
          </div>
        ) : (
          <BookList books={books} />
        )}
        <div className="mt-20 pt-10 border-t border-border-custom flex justify-center">
          <ErrorButton />
        </div>
      </main>
    );
  }
}

export default App;
