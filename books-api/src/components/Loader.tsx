import { Component } from 'react';

import type { LoaderProps } from '@/types/types';

class Loader extends Component<LoaderProps> {
  render() {
    const { query } = this.props;
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-lg">Searching for &quot;{query || 'books'}&quot;...</p>
      </div>
    );
  }
}

export default Loader;
