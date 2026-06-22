'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { handleRefreshServerCacheAction } from '@/app/actions';
import Button from '@/components/Button';
import { booksApi } from '@/services/BooksService';
import { useAppDispatch } from '@/state/store';
import type { RefreshCacheButtonProps } from '@/types/types';

interface ImprovedRefreshProps extends Omit<RefreshCacheButtonProps, 'onRefresh'> {
  onRefresh?: () => void;
  id?: string;
}

export const RefreshCacheButton = ({
  onRefresh,
  isFetching: externalIsFetching,
  variant = 'main',
  id,
}: ImprovedRefreshProps) => {
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('App');

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    startTransition(async () => {
      if (variant === 'details' && id) {
        dispatch(booksApi.util.invalidateTags([{ type: 'BookDetails', id }]));
      } else {
        dispatch(booksApi.util.invalidateTags(['Books']));
      }

      await handleRefreshServerCacheAction();
    });
  };

  const isLoading = externalIsFetching || isPending;
  const positionClass = variant === 'main' ? 'top-30 left-6' : 'bottom-24 right-6';

  const label =
    variant === 'main'
      ? isLoading
        ? t('refreshing')
        : t('refreshBooks')
      : isLoading
        ? t('refreshing')
        : t('refreshBookData');

  return (
    <Button
      className={`fixed ${positionClass} z-50 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:brightness-110 active:scale-98 transition-all disabled:cursor-not-allowed flex items-center gap-2 ${
        isLoading ? 'opacity-50 pointer-events-none' : ''
      }`}
      disabled={isLoading}
      onClick={handleRefresh}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      ) : null}
      {label}
    </Button>
  );
};

export default RefreshCacheButton;
