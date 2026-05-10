import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ErrorMessage from '@/components/ErrorMessage';

describe('ErrorMessage Component', () => {
  const mockProps = {
    message: 'Failed to fetch books',
    onRetry: vi.fn(),
  };

  it('renders the error message correctly', () => {
    render(<ErrorMessage {...mockProps} />);
    expect(screen.getByText('Failed to fetch books')).toBeInTheDocument();
    expect(screen.getByText('Error Alert')).toBeInTheDocument();
  });

  it('calls onRetry callback when retry button is clicked', () => {
    render(<ErrorMessage {...mockProps} />);
    const retryButton = screen.getByRole('button', { name: /retry search/i });
    fireEvent.click(retryButton);

    expect(mockProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('has the correct container classes for styling', () => {
    const { container } = render(<ErrorMessage {...mockProps} />);
    const mainDiv = container.firstChild;

    expect(mainDiv).toHaveClass('bg-red-50');
    expect(mainDiv).toHaveClass('text-red-600');
  });

  it('renders correctly with a different message', () => {
    const newMessage = 'Network timeout';
    render(<ErrorMessage message={newMessage} onRetry={vi.fn()} />);

    expect(screen.getByText(newMessage)).toBeInTheDocument();
  });
});
