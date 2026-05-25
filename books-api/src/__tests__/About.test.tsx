import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { ThemeProvider } from '@/context/ThemeContext';
import About from '@/pages/About';

vi.mock('@/hooks/storageHook', () => ({
  default: () => ({ searchQuery: '', storagePage: 1, setSearchQuery: vi.fn() }),
}));

vi.mock('@/services/BooksService', () => ({
  searchBooks: vi.fn(() => Promise.resolve({ books: [], totalPages: 1 })),
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      selectedReducer: () => ({ selectedBooks: [] }),
    },
  });

describe('About Page Integration', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
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

  const renderAppRouterEnvironment = (initialPath = '/') => {
    const store = createMockStore();
    const router = createMemoryRouter(
      [
        { path: '/', element: <App /> },
        { path: '/about', element: <About /> },
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

    expect(screen.getByRole('heading', { name: /about books catalogue/i })).toBeInTheDocument();
    expect(screen.getByText(/Developer:/i)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: /rs school react course official site/i });
    expect(courseLink).toBeInTheDocument();
    expect(courseLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
  });

  it('provides a functional navigation bridge element accessible straight from the dashboard views', async () => {
    const user = userEvent.setup();
    const { router } = renderAppRouterEnvironment('/');

    const aboutNavigationLink = screen.getByRole('link', { name: /about the app/i });
    expect(aboutNavigationLink).toBeInTheDocument();

    await user.click(aboutNavigationLink);
    expect(router.state.location.pathname).toBe('/about');
    expect(screen.getByRole('heading', { name: /about books catalogue/i })).toBeInTheDocument();
  });
});
