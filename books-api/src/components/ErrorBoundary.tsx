// components/ErrorBoundary.tsx
'use client';

import { Component, type ErrorInfo } from 'react';

import Button from '@/components/Button';
import type { BoundaryProps, BoundaryState } from '@/types/types';

interface ImprovedBoundaryState extends BoundaryState {
  error?: Error | null;
}

class ErrorBoundary extends Component<BoundaryProps, ImprovedBoundaryState> {
  state: ImprovedBoundaryState = {
    hasError: false,
    error: null,
  };

  // Перехватываем ошибку и обновляем состояние
  static getDerivedStateFromError(error: Error): ImprovedBoundaryState {
    // ИСПРАВЛЕНО: Если это внутренняя системная ошибка редиректа Next.js,
    // мы НЕ взводим состояние ошибки, позволяя роутеру выполнить переход!
    if (error.message === 'NEXT_REDIRECT' || error.message?.includes('NEXT_REDIRECT')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // ИСПРАВЛЕНО: Пропускаем логирование системных редиректов в консоль
    if (error.message === 'NEXT_REDIRECT' || error.message?.includes('NEXT_REDIRECT')) {
      return;
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { children } = this.props;
    const { hasError, error } = this.state;

    // ИСПРАВЛЕНО: Дополнительная страховка во время рендера
    if (hasError && error?.message !== 'NEXT_REDIRECT' && !error?.message?.includes('NEXT_REDIRECT')) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl m-4 text-center animate-in fade-in zoom-in-95 duration-250">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 text-xl font-bold mb-4">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</h2>

          <p className="text-red-500 dark:text-red-400/80 mb-4 max-w-md text-sm">
            The application encountered an unexpected error.
          </p>

          {error ? (
            <div className="w-full max-w-md p-3 mb-6 bg-red-100/50 dark:bg-red-950/40 border border-red-200/40 rounded-xl text-left font-mono text-xs text-red-700 dark:text-red-300 break-words overflow-x-auto">
              <strong>Error:</strong> {error.message || String(error)}
            </div>
          ) : null}

          <Button
            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20 px-6 py-2.5 font-semibold text-sm active:scale-98 transition-all"
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
