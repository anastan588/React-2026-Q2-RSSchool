'use client';

import React from 'react';

import { addBook, removeBook } from '@/state/selectedSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import type { BookSelectionCheckboxProps } from '@/types/types';

export const BookSelectionCheckbox = ({ book }: BookSelectionCheckboxProps) => {
  const dispatch = useAppDispatch();
  const { id, title } = book;

  const isSelected = useAppSelector((state) =>
    state.selected.selectedBooks.some((selectedBook) => selectedBook.id === id),
  );

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();

    if (e.target.checked) {
      dispatch(addBook(book));
    } else {
      dispatch(removeBook(id));
    }
  };

  return (
    <div className="inline-block cursor-pointer select-none p-1" onClick={(e) => e.stopPropagation()}>
      <input
        aria-label={`Select ${title}`}
        checked={isSelected}
        className="w-5 h-5 cursor-pointer accent-primary rounded-sm"
        type="checkbox"
        onChange={handleCheckboxChange}
      />
    </div>
  );
};

export default BookSelectionCheckbox;
