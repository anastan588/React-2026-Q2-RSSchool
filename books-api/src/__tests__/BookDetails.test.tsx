import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BookDetails from '@/pages/BookDetails';
import { fetchBookDetails } from '@/services/BooksService';
import type { Book, ExtendedBook } from '@/types/types';

vi.mock('@/services/BooksService', () => ({
  fetchBookDetails: vi.fn(),
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Mock Loading {query}</div>,
}));

const createMockStore = (initialValue: Book[] = []) =>
  configureStore({
    reducer: {
      selectedReducer: () => ({ selectedBooks: initialValue }),
    },
  });

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
    vi.clearAllMocks();
  });

  it('renders a loading indicator while data is being fetched from the API', async () => {
    vi.mocked(fetchBookDetails).mockImplementation(() => new Promise(() => {}));

    renderBookDetailsWithRouter();

    expect(screen.getByTestId('details-loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveTextContent(/book detailes/i);
  });

  it('successfully displays metadata profiles upon valid promise settlement resolution', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);

    renderBookDetailsWithRouter();

    expect(await screen.findByRole('heading', { name: 'Book Profile' })).toBeInTheDocument();
    expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    expect(screen.getByText('First Published: January 1938')).toBeInTheDocument();
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
    vi.mocked(fetchBookDetails).mockResolvedValue({
      ...mockBookData,
      places: [],
    });

    renderBookDetailsWithRouter();

    expect(await screen.findByText('Not Specified')).toBeInTheDocument();
  });

  it('renders a fallback neutral image asset if the book asset cover reference is empty string', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue({
      ...mockBookData,
      cover: '',
    });

    renderBookDetailsWithRouter();

    const coverImage = await screen.findByRole('img', { name: 'The Hobbit' });
    expect(coverImage).toHaveAttribute('src', expect.stringContaining('mock-book.jpg'));
  });

  it('renders explicit error descriptors when the API pipeline fails', async () => {
    const errorString = 'Too many requests. Please slow down and try again in a minute.';
    vi.mocked(fetchBookDetails).mockRejectedValue(new Error(errorString));

    renderBookDetailsWithRouter();

    expect(await screen.findByText(errorString)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close panel/i })).toBeInTheDocument();
  });

  it('preserves the page parameter in the query string route when clicking the header close cross action', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);
    const { router } = renderBookDetailsWithRouter(['/details/OL27482W?page=15']);

    const closeButton = await screen.findByRole('button', { name: /close details/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
      expect(router.state.location.search).toBe('?page=15');
    });
  });

  it('falls back to structural root route if no historical page context parameters are available on close', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);
    const { router } = renderBookDetailsWithRouter(['/details/OL27482W']);

    const closeButton = await screen.findByRole('button', { name: /close details/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
      expect(router.state.location.search).toBe('');
    });
  });

  it('renders selection checkbox inside panel linked with specific book state', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);

    renderBookDetailsWithRouter(['/details/OL27482W']);

    const checkbox = await screen.findByRole('checkbox', { name: new RegExp(`select ${mockBookData.title}`, 'i') });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('reflects correct check status if book is pre-selected in data store parameters', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);

    const existingBook: Book = {
      id: mockBookData.id,
      title: mockBookData.title,
      author: mockBookData.author,
      category: mockBookData.category,
      cover: mockBookData.cover,
      openLibraryUrl: mockBookData.openLibraryUrl,
    };

    renderBookDetailsWithRouter(['/details/OL27482W'], [existingBook]);

    const checkbox = await screen.findByRole('checkbox', { name: new RegExp(`select ${mockBookData.title}`, 'i') });
    expect(checkbox).toBeChecked();
  });
});
