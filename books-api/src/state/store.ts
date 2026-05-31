import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux'; // Добавлен тип
import { useDispatch, useSelector } from 'react-redux'; // Добавлен импорт

import { booksApi } from '@/services/BooksService';
import selectedReducer from '@/state/selectedSlice';

export const store = configureStore({
  reducer: {
    selected: selectedReducer,
    [booksApi.reducerPath]: booksApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(booksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
