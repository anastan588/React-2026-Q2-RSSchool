'use client';

import { useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { handleSearchAction } from '@/app/actions';
import Header from '@/components/Header';
import useSearchStorage from '@/hooks/StorageHook';

export const HeaderWrapper = () => {
  const searchParams = useSearchParams();
  const { setSearchQuery, setStoragePage } = useSearchStorage();
  const [isPending, startTransition] = useTransition();

  const safeParams = searchParams || new URLSearchParams();
  const urlQueryStr = safeParams.get('q') || '';

  const handleSearch = useCallback(
    (value: string): void => {
      const trimmed = value.trim();
      if (trimmed === urlQueryStr) return;

      if (trimmed.length >= 3 || trimmed.length === 0) {
        setSearchQuery(trimmed);
        setStoragePage(1);

        startTransition(async () => {
          const formData = new FormData();
          formData.set('q', trimmed);
          await handleSearchAction(formData);
        });
      }
    },
    [urlQueryStr, setSearchQuery, setStoragePage],
  );

  return (
    <div
      className={
        isPending ? 'opacity-70 pointer-events-none transition-opacity duration-200 w-full' : 'opacity-100 w-full'
      }
    >
      <Header currentQuery={urlQueryStr} handleSearch={handleSearch} />
    </div>
  );
};

export default HeaderWrapper;
