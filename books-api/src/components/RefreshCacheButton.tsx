import React from 'react';

import Button from '@/components/Button';
import { booksApi } from '@/services/BooksService';
import { useAppDispatch, useAppSelector } from '@/state/store';

export const RefreshCacheButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const isAnyFetching = useAppSelector((state) =>
    Object.values(state.booksApi.queries).some((query) => query?.status === 'pending'),
  );

  const handleManualRefresh = (): void => {
    if (isAnyFetching) return;
    dispatch(booksApi.util.invalidateTags(['Books', 'BookDetails']));
  };

  return (
    <Button
      className="fixed top-30 right-6 z-50 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isAnyFetching}
      onClick={handleManualRefresh}
    >
      {isAnyFetching ? '⏳ Refreshing...' : '🔄 Refresh Books'}
    </Button>
  );
};

export default RefreshCacheButton;
