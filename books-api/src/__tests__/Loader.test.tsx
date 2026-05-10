import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loader from '@/components/Loader';

describe('Loader Component', () => {
  it('renders the provided search query', () => {
    const testQuery = 'JavaScript';
    render(<Loader query={testQuery} />);
    expect(screen.getByText(`Searching for "${testQuery}"...`)).toBeInTheDocument();
  });

  it('renders default text "books" when query is not provided', () => {
    render(<Loader query="" />);
    expect(screen.getByText('Searching for "books"...')).toBeInTheDocument();
  });
  it('has the correct animation classes', () => {
    const { container } = render(<Loader query="React" />);

    const loaderContainer = container.firstChild;
    const spinner = container.querySelector('.animate-spin');

    expect(loaderContainer).toHaveClass('animate-pulse');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full');
  });
});
