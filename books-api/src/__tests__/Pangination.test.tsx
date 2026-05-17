import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Pagination from '@/components/Pangination';

describe('Pagination Component', () => {
  const user = userEvent.setup();
  let mockOnPageChange: (page: number) => void;

  beforeEach(() => {
    mockOnPageChange = vi.fn();
  });

  it('should render nothing if total pages count is 1 or less', () => {
    const { container } = render(<Pagination current={1} total={1} onPageChange={mockOnPageChange} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render correct current and total page details text', () => {
    render(<Pagination current={3} total={10} onPageChange={mockOnPageChange} />);

    const pageText = screen.getByText('Page 3 of 10');
    expect(pageText).toBeInTheDocument();
  });

  it('should disable the Previous button when on the first page', () => {
    render(<Pagination current={1} total={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('should disable the Next button when on the last page', () => {
    render(<Pagination current={5} total={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should trigger onPageChange with decremented value when Previous is clicked', async () => {
    render(<Pagination current={3} total={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should trigger onPageChange with incremented value when Next is clicked', async () => {
    render(<Pagination current={3} total={5} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });
});
