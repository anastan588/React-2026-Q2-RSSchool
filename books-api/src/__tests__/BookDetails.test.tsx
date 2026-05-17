import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BookDetails from '@/pages/BookDetails';
import { fetchBookDetails } from '@/services/BooksService';
import type { ExtendedBook } from '@/types/types';

vi.mock('@/services/BooksService', () => ({
  fetchBookDetails: vi.fn(),
}));

vi.mock('@/components/Loader', () => ({
  default: ({ query }: { query: string }) => <div data-testid="loader">Mock Loading {query}</div>,
}));

describe('BookDetails Component', () => {
  const user = userEvent.setup();

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

  const renderBookDetailsWithRouter = (initialEntries = ['/details/OL27482W']) => {
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
      ...render(<RouterProvider router={router} />),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading indicator while data is being fetched from the API', async () => {
    vi.mocked(fetchBookDetails).mockImplementation(() => new Promise(() => {}));

    renderBookDetailsWithRouter();

    const loader = screen.getByTestId('details-loader');
    expect(loader).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveTextContent(/book detailes/i);
  });

  it('successfully displays metadata profiles upon valid promise settlement resolution', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);

    renderBookDetailsWithRouter();

    expect(await screen.findByRole('heading', { name: 'The Hobbit' })).toBeInTheDocument();
    expect(screen.getByText('First Published: January 1938')).toBeInTheDocument();
    expect(screen.getByText(mockBookData.description)).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();

    expect(screen.getByText('Middle-earth')).toBeInTheDocument();
    expect(screen.getByText('Rivendell')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: mockBookData.openLibraryUrl });
    expect(link).toHaveAttribute('href', mockBookData.openLibraryUrl);

    const coverImage = screen.getByRole('img', { name: 'The Hobbit' });
    expect(coverImage).toHaveAttribute('src', mockBookData.cover);
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
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);
    const { router } = renderBookDetailsWithRouter(['/details/OL27482W?page=15']);

    const closeButton = await screen.findByRole('button', { name: /close details/i });
    await user.click(closeButton);
    expect(router.state.location.pathname).toBe('/');
    expect(router.state.location.search).toBe('?page=15');
  });

  it('falls back to structural root route if no historical page context parameters are available on close', async () => {
    vi.mocked(fetchBookDetails).mockResolvedValue(mockBookData);

    const { router } = renderBookDetailsWithRouter(['/details/OL27482W']);

    const closeButton = await screen.findByRole('button', { name: /close details/i });
    await user.click(closeButton);

    expect(router.state.location.pathname).toBe('/');
    expect(router.state.location.search).toBe('');
  });
});
