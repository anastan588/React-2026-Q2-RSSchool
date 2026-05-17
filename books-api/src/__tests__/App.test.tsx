import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import StorageService from '@/hooks/StorageHook';
import BookService from '@/services/BooksService';
import type { Book } from '@/types/types';

vi.mock('@/services/BooksService');
vi.mock('@/services/StorageService');

vi.mock('@/components/BookList', () => ({
  default: class MockBookList extends React.Component<{ books: Book[] }> {
    render() {
      const { books } = this.props;
      return <div data-testid="book-list">Books count: {books.length}</div>;
    }
  },
}));

vi.mock('@/components/Loader', () => ({
  default: class MockLoader extends React.Component<{ query: string }> {
    render() {
      const { query } = this.props;
      return <div data-testid="loader">Loading {query}</div>;
    }
  },
}));

vi.mock('@/components/ErrorMessage', () => ({
  default: class MockErrorMessage extends React.Component<{
    message: string;
    onRetry: () => void;
  }> {
    render() {
      const { message, onRetry } = this.props;
      return (
        <div data-testid="error-message">
          <p>{message}</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      );
    }
  },
}));

vi.mock('@/components/SearchField', () => ({
  default: class MockSearchField extends React.Component<{ onSearch: (v: string) => void; initialValue: string }> {
    render() {
      const { onSearch, initialValue } = this.props;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('search') as HTMLInputElement;
            onSearch(input.value);
          }}
        >
          <input data-testid="search-input" defaultValue={initialValue} name="search" />
          <button type="submit">Search</button>
        </form>
      );
    }
  },
}));

describe('App Component Integration', () => {
  const user = userEvent.setup();
  const mockBooks: Book[] = [
    { id: '1', title: 'Clean Code', author: 'Robert Martin', category: '', cover: '', openLibraryUrl: '' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('');
    vi.mocked(BookService.searchBooks).mockResolvedValue(mockBooks);
  });

  it('reads from StorageService on mount and performs search', async () => {
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('Tolkien');

    render(<App />);

    expect(StorageService.getSearchQuery).toHaveBeenCalled();
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('Tolkien', expect.any(Object));
    });
  });

  it('updates StorageService and fetches books on valid search', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Orwell');
    await user.click(button);

    expect(StorageService.setSearchQuery).toHaveBeenCalledWith('Orwell');
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('Orwell', expect.any(Object));
    });
  });

  it('prevents search and storage update if query is < 3 characters', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Ab');
    await user.click(button);
    expect(StorageService.setSearchQuery).not.toHaveBeenCalledWith('Ab');
  });

  it('renders ErrorMessage and handles retry', async () => {
    const errorMsg = 'API Failure';
    vi.mocked(BookService.searchBooks).mockRejectedValueOnce(new Error(errorMsg)).mockResolvedValueOnce(mockBooks);

    render(<App />);
    const errorDisplay = await screen.findByText(errorMsg);
    expect(errorDisplay).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await user.click(retryBtn);
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledTimes(2);
    });
  });

  it('prevents duplicate searches for the same query', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });
    await user.type(input, 'React');
    await user.click(button);
    await user.click(button);
    expect(BookService.searchBooks).toHaveBeenCalledTimes(2);
  });

  it('verifies that the component reads the correct value from localStorage on mount', async () => {
    const storedQuery = 'Agatha';
    vi.mocked(StorageService.getSearchQuery).mockReturnValue(storedQuery);

    render(<App />);

    expect(StorageService.getSearchQuery).toHaveBeenCalled();
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith(storedQuery, expect.any(Object));
    });
  });

  it('verifies that the component writes to localStorage after a valid search', async () => {
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('');
    render(<App />);

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });
    const newQuery = 'Harry';
    await user.clear(input);
    await user.type(input, newQuery);
    await user.click(button);
    expect(StorageService.setSearchQuery).toHaveBeenCalledWith(newQuery);
  });

  it('covers cases where localStorage is empty (default behavior)', async () => {
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('');

    render(<App />);
    expect(StorageService.getSearchQuery).toHaveBeenCalled();
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('', expect.any(Object));
    });
  });

  it('ensures localStorage update logic does not break component for invalid queries', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Hi');
    await user.click(button);
    expect(StorageService.setSearchQuery).not.toHaveBeenCalledWith('Hi');
    expect(screen.queryByTestId('loader') || screen.queryByTestId('book-list')).toBeInTheDocument();
  });

  it('verifies localStorage is updated when search is cleared (0 characters)', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });
    await user.type(input, 'Valid Query');
    await user.click(button);
    vi.clearAllMocks();
    await user.clear(input);
    expect(input).toHaveValue('');
    await user.click(button);
    await waitFor(() => {
      expect(StorageService.setSearchQuery).toHaveBeenCalledWith('');
    });
  });

  it('verifies that the component reads and applies the correct value when localStorage contains a value', async () => {
    const existingQuery = 'JavaScript';
    vi.mocked(StorageService.getSearchQuery).mockReturnValue(existingQuery);
    vi.mocked(BookService.searchBooks).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );
    render(<App />);
    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue(existingQuery);
    const loader = await screen.findByTestId('loader');
    expect(loader).toHaveTextContent(new RegExp(existingQuery, 'i'));
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith(existingQuery, expect.any(Object));
    });
  });
});
