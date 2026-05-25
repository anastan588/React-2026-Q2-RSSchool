import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import Pagination from '@/components/Pangination';

describe('Pagination Component', () => {
  const renderPaginationWithRouter = (current: number, total: number, initialPath = '/') => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Pagination current={current} total={total} />,
        },
      ],
      { initialEntries: [initialPath] },
    );

    const renderResult = render(<RouterProvider router={router} />);

    return {
      ...renderResult,
      router,
    };
  };

  it('should render nothing if total pages count is 1 or less', () => {
    const { container } = renderPaginationWithRouter(1, 1);
    expect(container.firstChild).toBeNull();
  });

  it('should render correct current and total page details text', () => {
    renderPaginationWithRouter(3, 10);

    const pageText = screen.getByText('Page 3 of 10');
    expect(pageText).toBeInTheDocument();
  });

  it('should disable the Previous button when on the first page', () => {
    renderPaginationWithRouter(1, 5);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('should disable the Next button when on the last page', () => {
    renderPaginationWithRouter(5, 5);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should change URL parameter to decremented value when Previous is clicked', async () => {
    const user = userEvent.setup();
    const { router } = renderPaginationWithRouter(3, 5, '/?page=3');

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    await waitFor(() => {
      expect(router.state.location.search).toContain('page=2');
    });
  });

  it('should change URL parameter to incremented value when Next is clicked', async () => {
    const user = userEvent.setup();
    const { router } = renderPaginationWithRouter(3, 5, '/?q=js&page=3');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await waitFor(() => {
      expect(router.state.location.search).toContain('page=4');
      expect(router.state.location.search).toContain('q=js');
    });
  });
});
