import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/context/ThemeContext';
import About from '@/pages/About';

vi.mock('@/hooks/StorageHook', () => ({
  default: () => ({ searchQuery: '', storagePage: 1, setSearchQuery: vi.fn() }),
}));

vi.mock('@/services/BooksService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/BooksService')>();
  return {
    ...actual,
    searchBooks: vi.fn(() => Promise.resolve({ books: [], totalPages: 1 })),
    booksApi: {
      reducerPath: 'booksApi',
      reducer: () => ({}),
      middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action),
    },
  };
});

const createMockStore = () =>
  configureStore({
    reducer: {
      selected: () => ({ selectedBooks: [] }),
      booksApi: () => ({}),
    },
  });

describe('About Page Integration', () => {
  beforeAll(() => {
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
  });

  const renderAppRouterEnvironment = (initialPath = '/about') => {
    const store = createMockStore();

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div data-testid="main-dashboard">Main Page Layout</div>,
        },
        {
          path: '/about',
          element: <About />,
        },
      ],
      { initialEntries: [initialPath] },
    );

    return {
      router,
      ...render(
        <Provider store={store}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </Provider>,
      ),
    };
  };

  it('displays author details and an external hyperlink pointing to the course details layout', () => {
    renderAppRouterEnvironment('/about');

    expect(screen.getByRole('heading', { level: 1, name: /about books catalogue/i })).toBeInTheDocument();
    expect(screen.getByText(/Developer:/i)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: /rs school react course official site/i });
    expect(courseLink).toBeInTheDocument();
    expect(courseLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(courseLink).toHaveAttribute('target', '_blank');
  });

  it('navigates back to the main dashboard when clicking the back button', async () => {
    const user = userEvent.setup();
    const { router } = renderAppRouterEnvironment('/about');

    const backButton = screen.getByRole('button', { name: /back to main page/i });
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
  });
});
