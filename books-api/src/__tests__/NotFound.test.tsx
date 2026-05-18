import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotFound from '@/pages/NotFound';

const createMockStorage = (initialQuery = '', initialPage = 1) => {
  const state = {
    searchQuery: initialQuery,
    storagePage: initialPage,
  };
  return {
    state,
    setSearchQuery: vi.fn(),
    setStoragePage: vi.fn(),
    clearSearch: vi.fn(),
  };
};

let mockStorageInstance = createMockStorage();

vi.mock('@/hooks/StorageHook', () => ({
  default: () => ({
    searchQuery: mockStorageInstance.state.searchQuery,
    storagePage: mockStorageInstance.state.storagePage,
    setSearchQuery: mockStorageInstance.setSearchQuery,
    setStoragePage: mockStorageInstance.setStoragePage,
    clearSearch: mockStorageInstance.clearSearch,
  }),
}));

describe('Feature 4: 404 Page Integration', () => {
  const user = userEvent.setup();

  const renderRouterAtRoute = (initialPath: string) => {
    const router = createMemoryRouter(
      [
        { path: '/', element: <div data-testid="main-app">Main App Layout</div> },
        { path: '*', element: <NotFound /> },
      ],
      { initialEntries: [initialPath] },
    );
    return {
      router,
      ...render(<RouterProvider router={router} />),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageInstance = createMockStorage('', 1);
  });

  it('displays the 404 page for all non-existing routes', () => {
    renderRouterAtRoute('/some-random-invalid-route-123');

    const heading = screen.getByRole('heading', { name: /404/i });
    const message = screen.getByText(/Page Not Found/i);

    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it('provides a structural option to return back to the main application view', async () => {
    renderRouterAtRoute('/missing-page');

    const returnBtn = screen.getByRole('button', { name: /return to main app/i });
    expect(returnBtn).toBeInTheDocument();

    await user.click(returnBtn);
    expect(screen.getByTestId('main-app')).toHaveTextContent('Main App Layout');
  });

  it('navigates to the main app layout with the saved page query parameter when Return to Main App is clicked', async () => {
    mockStorageInstance = createMockStorage('', 12);

    const { router } = renderRouterAtRoute('/invalid-route-path');

    const returnToMainBtn = screen.getByRole('button', { name: /return to main app/i });
    expect(returnToMainBtn).toBeInTheDocument();

    await user.click(returnToMainBtn);

    expect(screen.getByTestId('main-app')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=12');
  });

  it('navigates back to the previous history location entry when Go Back is clicked', async () => {
    const router = createMemoryRouter(
      [
        { path: '/previous-good-page', element: <div>Previous Page Content</div> },
        { path: '*', element: <NotFound /> },
      ],
      {
        initialEntries: ['/previous-good-page', '/broken-malformed-route'],
        initialIndex: 1,
      },
    );

    render(<RouterProvider router={router} />);

    const goBackBtn = screen.getByRole('button', { name: /go back/i });
    expect(goBackBtn).toBeInTheDocument();

    await user.click(goBackBtn);

    expect(screen.getByText('Previous Page Content')).toBeInTheDocument();
  });
});
