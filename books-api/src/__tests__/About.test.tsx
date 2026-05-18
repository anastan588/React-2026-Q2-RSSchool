import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import App from '@/App';
import About from '@/pages/About';

vi.mock('@/hooks/storageHook', () => ({
  default: () => ({ searchQuery: '', storagePage: 1, setSearchQuery: vi.fn() }),
}));
vi.mock('@/services/BooksService', () => ({ searchBooks: vi.fn(() => Promise.resolve({ books: [], totalPages: 1 })) }));

describe('Feature 3: About Page Integration', () => {
  const user = userEvent.setup();

  const renderAppRouterEnvironment = (initialPath = '/') => {
    const router = createMemoryRouter(
      [
        { path: '/', element: <App /> },
        { path: '/about', element: <About /> },
      ],
      { initialEntries: [initialPath] },
    );
    return { router, ...render(<RouterProvider router={router} />) };
  };

  it('displays author details and an external hyperlink pointing to the course details layout', () => {
    renderAppRouterEnvironment('/about');

    expect(screen.getByRole('heading', { name: /about books catalogue/i })).toBeInTheDocument();
    expect(screen.getByText(/Developer:/i)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: /rs school react course/i });
    expect(courseLink).toBeInTheDocument();
    expect(courseLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
  });

  it('provides a functional navigation bridge element accessible straight from the dashboard views', async () => {
    const { router } = renderAppRouterEnvironment('/');

    const aboutNavigationLink = screen.getByRole('link', { name: /about the app/i });
    expect(aboutNavigationLink).toBeInTheDocument();

    await user.click(aboutNavigationLink);
    expect(router.state.location.pathname).toBe('/about');
    expect(screen.getByRole('heading', { name: /about books catalogue/i })).toBeInTheDocument();
  });
});
