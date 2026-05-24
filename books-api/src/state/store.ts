import { configureStore } from '@reduxjs/toolkit';

import selectedReducer from '@/state/selectedSlice';

export const store = configureStore({
  reducer: { selectedReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
