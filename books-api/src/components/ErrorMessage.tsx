import { Component } from 'react';

import Button from '@/components/Button';
import type { ErrorMessageProps } from '@/types/types';

class ErrorMessage extends Component<ErrorMessageProps> {
  render() {
    const { message, onRetry } = this.props;
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-8 rounded-3xl text-center mb-8 animate-in fade-in">
        <p className="text-xs uppercase tracking-widest font-bold mb-2 opacity-60">Error Alert</p>
        <p className="mb-6 font-medium">{message}</p>
        <Button className="bg-red-600! shadow-red-600/20! px-6! py-2! text-sm" onClick={onRetry}>
          Retry Search
        </Button>
      </div>
    );
  }
}

export default ErrorMessage;
