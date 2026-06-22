'use client';

import { type ReactNode } from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/context/ThemeContext';
import { store } from '@/state/store';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};
