import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { Book } from '@/types/types';

export interface SelectedState {
  selectedBooks: Book[];
}

const initialState: SelectedState = {
  selectedBooks: [],
};

export const selectedSlice = createSlice({
  name: 'selected',
  initialState,
  reducers: {
    addBook: (state, action: PayloadAction<Book>) => {
      state.selectedBooks.push(action.payload);
    },
    removeBook: (state, action: PayloadAction<string>) => {
      state.selectedBooks = state.selectedBooks.filter((book) => book.id !== action.payload);
    },
    clearBooks: (state) => {
      state.selectedBooks = [];
    },
  },
});

export const { addBook, removeBook, clearBooks } = selectedSlice.actions;

export default selectedSlice.reducer;
