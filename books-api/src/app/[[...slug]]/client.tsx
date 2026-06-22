'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';

import useSearchStorage from '@/hooks/StorageHook';
import { booksApi, useSearchBooksQuery } from '@/services/BooksService';
import { useAppDispatch, useAppSelector } from '@/state/store';
import type { Book } from '@/types/types';

interface ServerData {
  books: Book[];
  totalPages: number;
}
interface ClientOnlyProps {
  initialServerData: ServerData;
  serverQuery: string;
  serverPage: string;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const ClientOnly = ({ initialServerData, serverQuery, serverPage }: ClientOnlyProps) => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { setSearchQuery, setStoragePage } = useSearchStorage();

  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const safeParams = searchParams || new URLSearchParams();
  const urlQueryStr = safeParams.get('q') || '';
  const urlPageStr = safeParams.get('page') || '1';

  const queryArg = urlQueryStr || 'A.A.';
  const pageArg = parseInt(urlPageStr, 10) || 1;

  const isMatchingServerData = initialServerData && urlQueryStr === serverQuery && urlPageStr === serverPage;

  const hasServerDataInStore = useAppSelector((state) => {
    const cacheKey = booksApi.endpoints.searchBooks.select({
      query: serverQuery || 'A.A.',
      page: parseInt(serverPage, 10) || 1,
    })(state);
    return !!cacheKey?.data?.books?.length;
  });

  useEffect(() => {
    if (isMounted && !hasServerDataInStore && initialServerData.books.length > 0) {
      dispatch(
        booksApi.util.upsertQueryData(
          'searchBooks',
          { query: serverQuery || 'A.A.', page: parseInt(serverPage, 10) || 1 },
          { books: initialServerData.books, totalPages: initialServerData.totalPages },
        ),
      );
    }
  }, [isMounted, hasServerDataInStore, initialServerData, serverQuery, serverPage, dispatch]);

  useSearchBooksQuery(
    { query: queryArg, page: pageArg },
    { skip: !isMounted || isMatchingServerData || hasServerDataInStore },
  );

  useEffect(() => {
    if (isMounted) {
      setSearchQuery(urlQueryStr);
      setStoragePage(pageArg);
    }
  }, [isMounted, urlQueryStr, pageArg, setSearchQuery, setStoragePage]);

  if (!isMounted) return null;

  return <div className="hydration-context-holder hidden" style={{ display: 'none' }} />;
};

export default ClientOnly;
