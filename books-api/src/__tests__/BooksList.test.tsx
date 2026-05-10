import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BookList from '@/components/BookList';
import type { Book } from '@/types/types';

vi.mock('@/components/BookItem', () => ({
  default: ({ book }: { book: Book }) => <div data-testid="book-item">{book.title}</div>,
}));

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Book 1',
    author: 'Author 1',
    category: 'Cat 1',
    cover: '',
    openLibraryUrl: '',
  },
  {
    id: '2',
    title: 'Book 2',
    author: 'Author 2',
    category: 'Cat 2',
    cover: '',
    openLibraryUrl: '',
  },
];

describe('BookList Component', () => {
  it('renders a list of books when data is provided', () => {
    render(<BookList books={mockBooks} hasError={false} />);

    const items = screen.getAllByTestId('book-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
  });

  it('displays "No books found" message when book list is empty', () => {
    render(<BookList books={[]} hasError={false} />);

    expect(screen.getByText(/no books found/i)).toBeInTheDocument();
    expect(screen.queryByTestId('book-item')).not.toBeInTheDocument();
  });

  it('returns null and renders nothing when hasError is true', () => {
    const { container } = render(<BookList books={mockBooks} hasError={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with the correct CSS class for the grid', () => {
    render(<BookList books={mockBooks} hasError={false} />);

    const grid = screen.getByText('Book 1').parentElement;
    expect(grid).toHaveClass('book-grid');
  });
});
