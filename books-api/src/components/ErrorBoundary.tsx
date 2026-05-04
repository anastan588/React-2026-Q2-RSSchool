import { Component, type ErrorInfo } from 'react';

import Button from '@/components/Button';
import type { BoundaryProps, BoundaryState } from '@/types/types';

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 border border-red-100 rounded-3xl m-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-red-500 mb-8 max-w-md">
            The application encountered a critical error. Please try reloading the page.
          </p>
          <Button onClick={this.handleReset}>Reload App</Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
