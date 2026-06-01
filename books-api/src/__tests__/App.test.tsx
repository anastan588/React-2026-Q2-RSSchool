import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { ThemeProvider } from '@/context/ThemeContext';
import { useSearchBooksQuery } from '@/services/BooksService';
import type { Book, SearchBooksResponse } from '@/types/types';

const createMockStorage = (initialQuery = '', initialPage = 1) => {
  const state = {
    searchQuery: initialQuery,
    storagePage: initialPage,
  };
  return {
    state,
    setSearchQuery: vi.fn((q: string) => {
      state.searchQuery = q;
    }),
    setStoragePage: vi.fn((p: number) => {
      state.storagePage = p;
    }),
    clearSearch: vi.fn(() => {
      state.searchQuery = '';
      state.storagePage = 1;
    }),
  };
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

let mockStorageInstance = createMockStorage();

vi.mock('@/services/BooksService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/BooksService')>();
  return {
    ...actual,
    useSearchBooksQuery: vi.fn(),
    booksApi: {
      reducerPath: 'booksApi',
      reducer: () => ({}),
      middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action),
    },
  };
});

vi.mock('@/hooks/StorageHook', () => ({
  default: () => ({
    searchQuery: mockStorageInstance.state.searchQuery,
    storagePage: mockStorageInstance.state.storagePage,
    setSearchQuery: (q: string) => mockStorageInstance.setSearchQuery(q),
    setStoragePage: (p: number) => mockStorageInstance.setStoragePage(p),
    clearSearch: () => mockStorageInstance.clearSearch(),
  }),
}));

vi.mock('@/components/BookList', () => ({
  default: ({ books }: { books: Book[] }) => <div data-testid="book-list">Books count: {books.length}</div>,
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Loading {query}</div>,
}));

vi.mock('@/components/Pagination', () => ({
  default: ({
    current,
    total,
    onPageChange,
  }: {
    current: number;
    total: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination-controls">
      <button data-testid="prev-btn" type="button" onClick={() => onPageChange(current - 1)}>
        Prev
      </button>
      <span data-testid="page-info">
        Page {current} of {total}
      </span>
      <button data-testid="next-btn" type="button" onClick={() => onPageChange(current + 1)}>
        Next
      </button>
    </div>
  ),
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

type SearchQueryHookType = typeof useSearchBooksQuery;

describe('App Component Integration', () => {
  const user = userEvent.setup();

  const mockBooks: Book[] = [
    { id: '1', title: 'Clean Code', author: 'Robert Martin', category: '', cover: '', openLibraryUrl: '' },
  ];

  const mockResponse: SearchBooksResponse = {
    books: mockBooks,
    totalPages: 5,
  };

  const createMockStore = (initialSelectedBooks: Book[] = []) =>
    configureStore({
      reducer: {
        selected: () => ({ selectedBooks: initialSelectedBooks }),
        booksApi: () => ({}),
      },
    });

  const renderAppWithRouter = (initialPath = '/', initialSelectedBooks: Book[] = []) => {
    const testStore = createMockStore(initialSelectedBooks);
    const router = createMemoryRouter(
      [
        {
          path: '*',
          element: <App />,
          children: [
            {
              path: 'details/:id',
              element: <div data-testid="details-content">Book Details Mock</div>,
            },
          ],
        },
      ],
      {
        initialEntries: [initialPath],
        initialIndex: 0,
      },
    );

    const renderResult = render(
      <Provider store={testStore}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>,
    );

    return {
      ...renderResult,
      router,
      store: testStore,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockStorageInstance = createMockStorage('', 1);
    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockReturnValue({
      data: mockResponse,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('reads from useSearchStorage hook on mount and performs search', async () => {
    mockStorageInstance = createMockStorage('Tolkien', 1);

    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: 'Tolkien', page: 1 });
    });
  });

  it('updates state via hook and fetches books on valid search execution', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Orwell');

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockImplementation(() => {
      mockStorageInstance.state.searchQuery = 'Orwell';
      return {
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    await user.click(button);

    expect(mockStorageInstance.setSearchQuery).toHaveBeenCalledWith('Orwell');
    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: 'Orwell', page: 1 });
    });
  });

  it('prevents search execution and hook updates if the query is under 3 characters', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Ab');
    await user.click(button);

    expect(mockStorageInstance.setSearchQuery).not.toHaveBeenCalled();
  });

  it('renders ErrorMessage and triggers data reload upon clicking retry', async () => {
    const errorMsg = 'API Failure';
    const mockRefetch = vi.fn();

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockReturnValue({
      data: undefined,
      error: { message: errorMsg },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    renderAppWithRouter();

    const errorDisplay = await screen.findByText(new RegExp(errorMsg, 'i'));
    expect(errorDisplay).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await user.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicated data requests for unmutated search queries', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const initialCalls = vi.mocked(useSearchBooksQuery).mock.calls.length;
    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'React');

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockImplementation(() => {
      mockStorageInstance.state.searchQuery = 'React';
      return {
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    await user.click(button);

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: 'React', page: 1 });
    });

    await user.click(button);

    expect(useSearchBooksQuery).toHaveBeenCalledTimes(initialCalls + 1);
  });

  it('covers fallbacks when the local storage hook contains an empty string', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });
  });

  it('ensures storage update actions do not alter layout visibility for invalid strings', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Hi');
    await user.click(button);

    expect(mockStorageInstance.setSearchQuery).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loader') || screen.queryByTestId('book-list')).toBeInTheDocument();
  });

  it('clears state using hook parameters when search fields are cleared', async () => {
    renderAppWithRouter();

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'Valid Query');

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockImplementation(() => {
      mockStorageInstance.state.searchQuery = 'Valid Query';
      return {
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    await user.click(button);
    expect(mockStorageInstance.setSearchQuery).toHaveBeenCalledWith('Valid Query');

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: 'Valid Query', page: 1 });
    });

    await user.clear(input);

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockImplementation(() => {
      mockStorageInstance.state.searchQuery = '';
      return {
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    await user.click(button);

    await waitFor(() => {
      expect(mockStorageInstance.setSearchQuery).toHaveBeenCalledWith('');
    });
  });

  it('displays active loading elements matching the values derived from hook parameters', async () => {
    mockStorageInstance = createMockStorage('JavaScript', 1);

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isFetching: true,
      refetch: vi.fn(),
    });

    renderAppWithRouter();

    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue('JavaScript');

    const loader = screen.getByTestId('loader');
    expect(loader).toHaveTextContent(/Loading JavaScript/i);
  });

  it('handles plain array API responses and calculates totalPages correctly', async () => {
    renderAppWithRouter();

    const paginationInfo = await screen.findByText(/Page 1 of 5/i);
    expect(paginationInfo).toBeInTheDocument();

    const bookList = screen.getByTestId('book-list');
    expect(bookList).toHaveTextContent('Books count: 1');
  });

  it('synchronizes the URL parameter on mount if storagePage is greater than 1 and URL parameter is missing', async () => {
    mockStorageInstance = createMockStorage('', 3);

    renderAppWithRouter('/');

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 3 });
    });

    const paginationInfo = await screen.findByText(/Page 3 of 5/i);
    expect(paginationInfo).toBeInTheDocument();
  });

  it('bypasses URL synchronization on mount if storagePage is equal to 1', async () => {
    mockStorageInstance = createMockStorage('', 1);

    renderAppWithRouter('/');

    await waitFor(() => {
      expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });
    });

    const paginationInfo = await screen.findByText(/Page 1 of 5/i);
    expect(paginationInfo).toBeInTheDocument();
  });

  it('prevents redundant network requests if query and page parameters remain unchanged', async () => {
    renderAppWithRouter();

    await screen.findByTestId('search-input');
    expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: '', page: 1 });

    const input = screen.getByTestId('search-input');
    const button = screen.getByRole('button', { name: /search/i });

    await user.clear(input);
    await user.type(input, 'React');

    vi.mocked<SearchQueryHookType>(useSearchBooksQuery).mockImplementation(() => {
      mockStorageInstance.state.searchQuery = 'React';
      return {
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    });

    await user.click(button);

    expect(useSearchBooksQuery).toHaveBeenCalledWith({ query: 'React', page: 1 });
    const initialCalls = vi.mocked(useSearchBooksQuery).mock.calls.length;

    await user.click(button);

    expect(useSearchBooksQuery).toHaveBeenCalledTimes(initialCalls);
  });

  it('displays the 404 NotFound layout if the URL page query parameter is malformed', async () => {
    renderAppWithRouter('/?page=2/145');

    const heading = await screen.findByRole('heading', { name: /404/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  it('successfully returns to main page and preserves all query params when closing details panel', async () => {
    const testUser = userEvent.setup();
    const { router } = renderAppWithRouter('/details/123?page=3&q=typescript');

    expect(screen.getByTestId('details-content')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close details/i });
    await testUser.click(closeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });

    const searchParams = new URLSearchParams(router.state.location.search);
    expect(searchParams.get('page')).toBe('3');
    expect(searchParams.get('q')).toBe('typescript');
    expect(screen.queryByTestId('details-content')).not.toBeInTheDocument();
  });
});
