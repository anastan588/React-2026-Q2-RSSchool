import { Component } from 'react';

import Button from '@/components/Button';
import type { StateErrorButton } from '@/types/types';

class ErrorButton extends Component<Record<string, never>, StateErrorButton> {
  state: StateErrorButton = {
    shouldCrash: false,
  };

  handleCrash = (): void => {
    this.setState({ shouldCrash: true });
  };

  render() {
    const { shouldCrash } = this.state;

    if (shouldCrash) {
      throw new Error('Test Error: Application crashed as requested.');
    }

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button className="bg-red-500! shadow-red-500/20! text-xs py-2 px-4" onClick={this.handleCrash}>
          Throw error
        </Button>
      </div>
    );
  }
}

export default ErrorButton;
