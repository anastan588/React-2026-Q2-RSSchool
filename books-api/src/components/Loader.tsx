'use client';

import { useTranslations } from 'next-intl';

import type { LoaderProps } from '@/types/types';

export const Loader = ({ query }: LoaderProps) => {
  const t = useTranslations('Loader');

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-lg font-medium">{query ? t('searching', { query }) : t('loading')}</p>
    </div>
  );
};

export default Loader;
