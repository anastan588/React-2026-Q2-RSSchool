import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BookItem from '@/components/BookItem';
import type { Book } from '@/types/types';

vi.mock('@/assets/mock-book.jpg', () => ({
  default: 'mocked-neutral-image.jpg',
}));

const mockBook: Book = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  category: 'Classic',
  cover: 'gatsby-cover.jpg',
  id: '',
  openLibraryUrl: '',
};

describe('BookItem Component', () => {
  it('renders book details correctly', () => {
    render(<BookItem book={mockBook} />);

    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(mockBook.author)).toBeInTheDocument();
    expect(screen.getByText(mockBook.category)).toBeInTheDocument();

    const img = screen.getByAltText(`Cover for ${mockBook.title}`);
    expect(img).toHaveAttribute('src', mockBook.cover);
  });

  it('uses fallback image when the cover fails to load', () => {
    render(<BookItem book={mockBook} />);
    const img = screen.getByAltText(`Cover for ${mockBook.title}`);
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'mocked-neutral-image.jpg');
  });

  it('uses fallback image immediately if no cover is provided', () => {
    const bookWithoutCover = { ...mockBook, cover: '' };
    render(<BookItem book={bookWithoutCover} />);
    const img = screen.getByAltText(`Cover for ${mockBook.title}`);
    expect(img).toHaveAttribute('src', 'mocked-neutral-image.jpg');
  });
});
