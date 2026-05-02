import { Component, type ErrorInfo, type ReactNode } from 'react';

import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-accent-soft rounded-3xl border border-primary/10 m-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong.</h2>
          <p className="text-muted mb-8 max-w-md">The application encountered an unexpected error.</p>
          <Button onClick={this.handleReload}>Reload Application</Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
