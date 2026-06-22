'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { handlePageChangeAction } from '@/app/actions';
import Button from '@/components/Button';

export const Pagination = ({
  current,
  total,
  serverQuery,
  selectedBookId,
}: {
  current: number;
  total: number;
  serverQuery: string;
  selectedBookId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Pagination');

  if (total <= 1) return null;

  const navigateToPage = (targetPage: number) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('page', String(targetPage));
      formData.set('currentQuery', serverQuery);
      formData.set('selectedBookId', selectedBookId);

      await handlePageChangeAction(formData);
    });
  };

  const isPreviousDisabled = current <= 1 || isPending;
  const isNextDisabled = current >= total || isPending;

  return (
    <div
      className={`flex items-center gap-4 select-none transition-opacity duration-200 ${
        isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Button
        className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-card/50 disabled:hover:text-foreground disabled:hover:border-border-custom disabled:cursor-not-allowed flex items-center gap-2"
        disabled={isPreviousDisabled}
        type="button"
        onClick={() => navigateToPage(current - 1)}
      >
        {t('previous')}
      </Button>

      <span className="text-sm font-bold px-5 py-2.5 bg-card/30 border border-border-custom text-foreground rounded-xl min-w-[120px] text-center shadow-xs backdrop-blur-xs transition-colors duration-300 flex flex-col items-center justify-center">
        {isPending ? (
          <span className="text-xs text-primary animate-pulse font-medium">{t('loading')}</span>
        ) : (
          <span>{t('info', { current, total })}</span>
        )}
      </span>

      <Button
        className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-card/50 disabled:hover:text-foreground disabled:hover:border-border-custom disabled:cursor-not-allowed flex items-center gap-2"
        disabled={isNextDisabled}
        type="button"
        onClick={() => navigateToPage(current + 1)}
      >
        {t('next')}
      </Button>
    </div>
  );
};

export default Pagination;
