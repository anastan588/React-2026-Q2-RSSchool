'use client'; // Обязательно для клиентских контекстов

import { type ReactNode } from 'react';
import { Provider } from 'react-redux';

import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/context/ThemeContext';
import { store } from '@/state/store';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};
