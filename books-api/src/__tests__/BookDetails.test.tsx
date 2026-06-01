import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BookDetails from '@/pages/BookDetails';
import { useFetchBookDetailsQuery } from '@/services/BooksService';
import type { Book, ExtendedBook } from '@/types/types';

const mockDispatch = vi.fn((action) => {
  if (typeof action === 'function') {
    return action(mockDispatch, () => ({ selected: { selectedBooks: [] } }), undefined);
  }
  return action;
});

vi.mock('@/services/BooksService', () => ({
  useFetchBookDetailsQuery: vi.fn(),
  booksApi: {
    util: {
      invalidateTags: vi.fn(() => () => ({ type: 'mock-invalidate' })),
    },
  },
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Mock Loading {query}</div>,
}));

vi.mock('@/components/BookSelect', () => ({
  default: ({ book }: { book: Book }) => (
    <input aria-label={`select ${book.title}`} data-testid="mock-checkbox" type="checkbox" />
  ),
}));

vi.mock('@/utils/getErrorMessage', () => ({
  default: vi.fn((error) => (error ? ((error as { message?: string }).message ?? 'Error') : null)),
}));

const createMockStore = (initialValue: Book[] = []) => {
  const store = configureStore({
    reducer: {
      selected: () => ({ selectedBooks: initialValue }),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

  store.dispatch = mockDispatch;
  return store;
};

type QueryHookType = typeof useFetchBookDetailsQuery;

describe('BookDetails Component', () => {
  const mockBookData: ExtendedBook = {
    id: 'OL27482W',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasy',
    cover: 'https://openlibrary.org',
    openLibraryUrl: 'https://openlibrary.org',
    description: 'A tale of high adventure, undertaken by a company of dwarves...',
    publishDate: 'January 1938',
    places: ['Middle-earth', 'Rivendell'],
  };

  const renderBookDetailsWithRouter = (initialEntries = ['/details/OL27482W'], initialBooks: Book[] = []) => {
    const store = createMockStore(initialBooks);
    const router = createMemoryRouter(
      [
        {
          path: '/details/:id',
          element: <BookDetails />,
        },
        {
          path: '/',
          element: <div data-testid="main-dashboard">Dashboard Layout</div>,
        },
      ],
      { initialEntries },
    );

    return {
      router,
      store,
      ...render(
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>,
      ),
    };
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockDispatch.mockClear();
  });

  it('renders a loading indicator while data is being fetched from the API', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isFetching: true,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    expect(screen.getByTestId('details-loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveTextContent(/book detailes/i);
  });

  it('successfully displays metadata profiles upon valid promise settlement resolution', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    expect(screen.getByRole('heading', { level: 2, name: /book profile/i })).toBeInTheDocument();
    expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    expect(screen.getByText(mockBookData.description)).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Middle-earth')).toBeInTheDocument();
    expect(screen.getByText('Rivendell')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: mockBookData.openLibraryUrl })).toHaveAttribute(
      'href',
      mockBookData.openLibraryUrl,
    );
    expect(screen.getByRole('img', { name: 'The Hobbit' })).toHaveAttribute('src', mockBookData.cover);
  });

  it('displays "Not Specified" fallback layout if the places array data arrives empty', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: { ...mockBookData, places: [] },
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    expect(screen.getByText('Not Specified')).toBeInTheDocument();
  });

  it('renders a fallback neutral image asset if the book asset cover reference is empty string', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: { ...mockBookData, cover: '' },
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    const coverImage = screen.getByRole('img', { name: 'The Hobbit' });
    expect(coverImage).toHaveAttribute('src', expect.stringContaining('mock-book.jpg'));
  });

  it('renders explicit error descriptors when the API pipeline fails', async () => {
    const errorString = 'Too many requests. Please slow down and try again in a minute.';
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: undefined,
      error: { message: errorString },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    expect(screen.getByText(errorString)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close panel/i })).toBeInTheDocument();
  });

  it('preserves the page parameter in the query string route when clicking the header close cross action', async () => {
    const user = userEvent.setup();
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { router } = renderBookDetailsWithRouter(['/details/OL27482W?page=15']);

    const closeButton = screen.getByRole('button', { name: /close details/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
      expect(router.state.location.search).toBe('?page=15');
    });
  });

  it('falls back to structural root route if no historical page context parameters are available on close', async () => {
    const user = userEvent.setup();
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { router } = renderBookDetailsWithRouter(['/details/OL27482W']);

    const closeButton = screen.getByRole('button', { name: /close details/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
      expect(router.state.location.search).toBe('');
    });
  });

  it('renders selection checkbox inside panel linked with specific book state', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter(['/details/OL27482W']);

    const checkbox = screen.getByRole('checkbox', { name: new RegExp(`select ${mockBookData.title}`, 'i') });
    expect(checkbox).toBeInTheDocument();
  });

  it('displays the custom amber refresh button and triggers cache invalidation dispatch on click', async () => {
    const user = userEvent.setup();
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    const refreshButton = screen.getByRole('button', { name: /refresh book data/i });
    expect(refreshButton).toBeInTheDocument();

    await user.click(refreshButton);

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('overlays an intermediate loader panel and reduces layer opacity during refetching background cycles', async () => {
    vi.mocked<QueryHookType>(useFetchBookDetailsQuery).mockReturnValue({
      data: mockBookData,
      error: undefined,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    });

    renderBookDetailsWithRouter();

    const nestedLoader = screen.getByTestId('loader');
    expect(nestedLoader).toBeInTheDocument();
    expect(nestedLoader).toHaveTextContent(/book detailes/i);

    const mainLayoutContainer = screen.getByRole('main');
    expect(mainLayoutContainer).toHaveClass('opacity-30');
    expect(mainLayoutContainer).toHaveClass('pointer-events-none');
  });
});
