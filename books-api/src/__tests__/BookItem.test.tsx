import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import BookItem from '@/components/BookItem';
import type { Book } from '@/types/types';

vi.mock('@/assets/mock-book.jpg', () => ({
  default: 'mocked-neutral-image.jpg',
}));

const createMockStore = (initialValue: Book[] = []) =>
  configureStore({
    reducer: {
      selected: () => ({ selectedBooks: initialValue }),
    },
  });

const mockBook: Book = {
  id: '123',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  category: 'Classic',
  cover: 'gatsby-cover.jpg',
  openLibraryUrl: 'https://openlibrary.org',
};

const renderWithProvider = (ui: React.ReactElement, initialBooks: Book[] = []) => {
  const store = createMockStore(initialBooks);
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('BookItem Component', () => {
  it('renders book details correctly', () => {
    renderWithProvider(<BookItem book={mockBook} />);

    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(mockBook.author)).toBeInTheDocument();
    expect(screen.getByText(mockBook.category)).toBeInTheDocument();

    const img = screen.getByAltText(`Cover for ${mockBook.title}`);
    expect(img).toHaveAttribute('src', mockBook.cover);
  });

  it('uses fallback image when the cover fails to load', () => {
    renderWithProvider(<BookItem book={mockBook} />);
    const img = screen.getByAltText(`Cover for ${mockBook.title}`);

    fireEvent.error(img);

    expect(img).toHaveAttribute('src', 'mocked-neutral-image.jpg');
  });

  it('uses fallback image immediately if no cover is provided', () => {
    const bookWithoutCover = { ...mockBook, cover: '' };
    renderWithProvider(<BookItem book={bookWithoutCover} />);
    const img = screen.getByAltText(`Cover for ${mockBook.title}`);
    expect(img).toHaveAttribute('src', 'mocked-neutral-image.jpg');
  });

  it('isolates checkbox clicks from triggering card click behaviors', async () => {
    const user = userEvent.setup();
    const handleCardClick = vi.fn();

    renderWithProvider(
      <div onClick={handleCardClick}>
        <BookItem book={mockBook} />
      </div>,
    );

    const checkbox = screen.getByRole('checkbox', { name: `Select ${mockBook.title}` });
    await user.click(checkbox);

    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('allows card click behaviors when clicking outside the checkbox area', async () => {
    const user = userEvent.setup();
    const handleCardClick = vi.fn();

    renderWithProvider(
      <div onClick={handleCardClick}>
        <BookItem book={mockBook} />
      </div>,
    );

    const titleElement = screen.getByText(mockBook.title);
    await user.click(titleElement);

    expect(handleCardClick).toHaveBeenCalledTimes(1);
  });
});
