import { Component, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorButton from '@/components/ErrorButton';

class TestBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <h1>Crashed</h1>;
    }

    return children;
  }
}

describe('ErrorButton Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the throw error button initially', () => {
    render(<ErrorButton />);
    const button = screen.getByRole('button', { name: /throw error/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-red-500!');
  });

  it('throws an error when the button is clicked', () => {
    render(
      <TestBoundary>
        <ErrorButton />
      </TestBoundary>,
    );

    const button = screen.getByRole('button', { name: /throw error/i });
    fireEvent.click(button);

    expect(screen.getByText('Crashed')).toBeInTheDocument();
  });

  it('does not throw error if shouldCrash is false', () => {
    render(
      <TestBoundary>
        <ErrorButton />
      </TestBoundary>,
    );

    expect(screen.queryByText('Crashed')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
