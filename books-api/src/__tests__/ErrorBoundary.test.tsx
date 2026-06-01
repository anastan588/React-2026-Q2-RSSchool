import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorBoundary from '@/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test Error');
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Safe Content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('renders error UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/please try reloading the page/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument();
  });

  it('reloads the page when the reset button is clicked', () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { reload: reloadMock });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const button = screen.getByRole('button', { name: /reload app/i });
    fireEvent.click(button);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('logs the error to console when caught', () => {
    const consoleSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ErrorBoundary caught an error:'),
      expect.any(Error),
      expect.any(Object),
    );
  });
});
