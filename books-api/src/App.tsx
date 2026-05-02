import './App.css';

import { Component } from 'react';

import BookList from './components/BookList';
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
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      this.setState({ error, isLoading: false });
    }
  }

  render() {
    const { query, books, isLoading, error } = this.state;

    return (
      <main className="app-container">
        <SearchField initialValue={query} onSearch={this.handleSearch} />

        {error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center mb-6 border border-red-100">{error}</div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-muted text-lg">Searching for &quot;{query}&quot;...</p>
          </div>
        ) : (
          <BookList books={books} />
        )}
        <ErrorButton />
      </main>
    );
  }
}

export default App;
