import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import useSearchStorage from '@/hooks/StorageHook';
import BookService from '@/services/BooksService';
import type { Book } from '@/types/types';

vi.mock('@/services/BooksService');
vi.mock('@/hooks/StorageHook', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/BookList', () => ({
  default: ({ books }: { books: Book[] }) => <div data-testid="book-list">Books count: {books.length}</div>,
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Loading {query}</div>,
}));

vi.mock('@/components/ErrorMessage', () => ({
  default: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="error-message">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}));

vi.mock('@/components/SearchField', () => ({
  default: ({ onSearch, initialValue }: { onSearch: (v: string) => void; initialValue: string }) => (
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
  ),
}));

describe('App Component Integration', () => {
  const user = userEvent.setup();
  const mockBooks: Book[] = [
    { id: '1', title: 'Clean Code', author: 'Robert Martin', category: '', cover: '', openLibraryUrl: '' },
  ];

  const mockSetSearchQuery = vi.fn();
  const mockClearSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSearchStorage).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      clearSearch: mockClearSearch,
    });

    vi.mocked(BookService.searchBooks).mockResolvedValue(mockBooks);
  });

  it('reads from useSearchStorage hook on mount and performs search', async () => {
    vi.mocked(useSearchStorage).mockReturnValue({
      searchQuery: 'Tolkien',
      setSearchQuery: mockSetSearchQuery,
      clearSearch: mockClearSearch,
    });

    render(<App />);

    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('Tolkien', expect.any(Object));
    });
  });

  it('updates state via hook and fetches books on valid search execution', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Orwell');
    await user.click(button);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('Orwell');
    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('Orwell', expect.any(Object));
    });
  });

  it('prevents search execution and hook updates if the query is under 3 characters', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Ab');
    await user.click(button);

    expect(mockSetSearchQuery).not.toHaveBeenCalled();
  });

  it('renders ErrorMessage and triggers data reload upon clicking retry', async () => {
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

  it('prevents duplicated data requests for unmutated search queries', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, 'React');
    await user.click(button);
    await user.click(button);

    expect(BookService.searchBooks).toHaveBeenCalledTimes(2);
  });

  it('covers fallbacks when the local storage hook contains an empty string', async () => {
    render(<App />);

    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('', expect.any(Object));
    });
  });

  it('ensures storage update actions do not alter layout visibility for invalid strings', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Hi');
    await user.click(button);

    expect(mockSetSearchQuery).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loader') || screen.queryByTestId('book-list')).toBeInTheDocument();
  });

  it('clears state using hook parameters when search fields are cleared', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.click(button);

    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });
  });

  it('displays active loading elements matching the values derived from hook parameters', async () => {
    const existingQuery = 'JavaScript';
    vi.mocked(useSearchStorage).mockReturnValue({
      searchQuery: existingQuery,
      setSearchQuery: mockSetSearchQuery,
      clearSearch: mockClearSearch,
    });

    vi.mocked(BookService.searchBooks).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );

    render(<App />);

    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue(existingQuery);

    const loader = await screen.findByTestId('loader');
    expect(loader).toHaveTextContent(new RegExp(existingQuery, 'i'));
  });
});
