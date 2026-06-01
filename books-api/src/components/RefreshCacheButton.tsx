import React from 'react';

import Button from '@/components/Button';
import type { RefreshCacheButtonProps } from '@/types/types';

export const RefreshCacheButton: React.FC<RefreshCacheButtonProps> = ({ onRefresh, isFetching, variant = 'main' }) => {
  const positionClass = variant === 'main' ? 'top-30 left-6' : 'bottom-24 right-6';

  const label =
    variant === 'main'
      ? isFetching
        ? 'Refreshing...'
        : 'Refresh Books'
      : isFetching
        ? 'Refreshing...'
        : 'Refresh book data';

  return (
    <Button
      className={`fixed ${positionClass} z-50 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:brightness-110 active:scale-98 transition-all disabled:cursor-not-allowed flex items-center gap-2 ${
        isFetching ? 'opacity-50 pointer-events-none' : ''
      }`}
      disabled={isFetching}
      onClick={onRefresh}
    >
      <span className={`${isFetching ? 'animate-spin' : ''}`}>↻</span>
      {label}
    </Button>
  );
};

export default RefreshCacheButton;
