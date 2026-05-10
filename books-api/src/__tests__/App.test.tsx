import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BookService from '@/services/BooksService';
import StorageService from '@/services/StorageService';
import type { Book } from '@/types/types';

import App from '../App';

vi.mock('@/services/BooksService');
vi.mock('@/services/StorageService');

vi.mock('@/components/BookList', () => ({
  default: ({ books }: { books: Book[] }) => <div data-testid="book-list">Books count: {books.length}</div>,
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Loading results for {query}</div>,
}));

vi.mock('@/components/SearchField', () => ({
  default: ({ onSearch, initialValue }: { onSearch: (v: string) => void; initialValue: string }) => (
    <input data-testid="search-input" defaultValue={initialValue} onChange={(e) => onSearch(e.target.value)} />
  ),
}));

describe('App Component', () => {
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Clean Code',
      author: 'Robert Martin',
      category: '',
      cover: '',
      openLibraryUrl: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('');
    vi.mocked(BookService.searchBooks).mockResolvedValue(mockBooks);
  });

  it('loads books on mount using query from StorageService', async () => {
    vi.mocked(StorageService.getSearchQuery).mockReturnValue('React');

    render(<App />);

    expect(StorageService.getSearchQuery).toHaveBeenCalled();

    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledWith('React', { page: 1 });
      expect(screen.getByText('Books count: 1')).toBeInTheDocument();
    });
  });

  it('handles search input correctly with validation', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'ab' } });
    expect(StorageService.setSearchQuery).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'typescript' } });

    await waitFor(() => {
      expect(StorageService.setSearchQuery).toHaveBeenCalledWith('typescript');
      expect(BookService.searchBooks).toHaveBeenCalledWith('typescript', { page: 1 });
    });
  });

  it('renders ErrorMessage on service failure', async () => {
    const errorMessage = 'Network Error';
    vi.mocked(BookService.searchBooks).mockRejectedValue(new Error(errorMessage));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('prevents duplicate searches for the same query', async () => {
    render(<App />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'testing' } });
    fireEvent.change(input, { target: { value: 'testing' } });

    await waitFor(() => {
      expect(BookService.searchBooks).toHaveBeenCalledTimes(2);
    });
  });
});
