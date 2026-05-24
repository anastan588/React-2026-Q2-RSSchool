import { describe, expect, it } from 'vitest';

import selectedReducer, { addBook, clearBooks, removeBook } from '@/state/selectedSlice';
import type { Book, SelectedState } from '@/types/types';

const mockBook: Book = {
  id: '123',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  category: 'Classic',
  cover: 'gatsby-cover.jpg',
  openLibraryUrl: 'https://openlibrary.org',
};

describe('Selected Slice Reducers', () => {
  it('returns the initial state when an empty action is passed', () => {
    const result = selectedReducer(undefined, { type: '' });
    expect(result).toEqual({ selectedBooks: [] });
  });

  it('appends a book to the empty selection list via addBook action', () => {
    const initialState: SelectedState = { selectedBooks: [] };

    const result = selectedReducer(initialState, addBook(mockBook));

    expect(result.selectedBooks).toHaveLength(1);
    expect(result.selectedBooks[0]).toEqual(mockBook);
  });

  it('filters out a book from the list by its string identifier via removeBook action', () => {
    const initialState: SelectedState = { selectedBooks: [mockBook] };

    const result = selectedReducer(initialState, removeBook('123'));

    expect(result.selectedBooks).toEqual([]);
  });

  it('leaves the list unaffected if removeBook action specifies a non-existent identifier', () => {
    const initialState: SelectedState = { selectedBooks: [mockBook] };

    const result = selectedReducer(initialState, removeBook('999'));

    expect(result.selectedBooks).toHaveLength(1);
    expect(result.selectedBooks[0]).toEqual(mockBook);
  });

  it('purges all items inside the selection collection reset via clearBooks action', () => {
    const initialState: SelectedState = {
      selectedBooks: [mockBook, { ...mockBook, id: '456', title: '1984' }],
    };

    const result = selectedReducer(initialState, clearBooks());

    expect(result.selectedBooks).toEqual([]);
  });
});
