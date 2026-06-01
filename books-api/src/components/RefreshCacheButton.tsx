import React from 'react';

import Button from '@/components/Button';

interface RefreshCacheButtonProps {
  onRefresh: () => void;
  isFetching: boolean;
}

export const RefreshCacheButton: React.FC<RefreshCacheButtonProps> = ({ onRefresh, isFetching }) => {
  return (
    <Button
      className="fixed top-30 left-6 z-50 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isFetching}
      onClick={onRefresh}
    >
      {isFetching ? '⏳ Refreshing...' : '🔄 Refresh Books'}
    </Button>
  );
};

export default RefreshCacheButton;
