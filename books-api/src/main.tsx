import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

import ErrorBoundary from '@/components/ErrorBoundary.tsx';
import { ThemeProvider } from '@/context/ThemeContext';
import { router } from '@/router/Router';
import { store } from '@/state/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
