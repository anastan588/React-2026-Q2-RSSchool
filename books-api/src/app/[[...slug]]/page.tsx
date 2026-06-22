// app/[[...slug]]/page.tsx
import { Suspense } from 'react';

import { handleCloseDetailsAction } from '@/app/actions';
import NotFound from '@/app/not-found';
import BookList from '@/components/BookList';
import DetailsPanelShell from '@/components/DetailsPanelShell';
import ErrorButton from '@/components/ErrorButton';
import Pagination from '@/components/Pangination';
import RefreshCacheButton from '@/components/RefreshCacheButton';
import SelectedBooksFlyout from '@/components/SelectedFlayout';
import About from '@/pages/About';
import type { Book, OpenLibraryDoc } from '@/types/types';

import { ClientOnly } from './client';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
  numFound?: number;
}

interface ServerDataState {
  books: Book[];
  totalPages: number;
}

const getSingleStringParam = (param: string | string[] | undefined): string => {
  if (!param) return '';
  return Array.isArray(param) ? param[0] || '' : param;
};

export const generateStaticParams = () => {
  return [{ slug: [] }];
};

export const Page = async ({ params, searchParams }: PageProps) => {
  const unwrappedParams = await params;
  const unwrappedSearch = await searchParams;

  const slug = unwrappedParams.slug || [];

  // ИСПРАВЛЕНО: Безопасное сравнение элемента массива строк
  if (slug[0] === 'about' && slug.length === 1) {
    return <About />;
  }

  const rawQuery = getSingleStringParam(unwrappedSearch.q);
  const rawPageStr = getSingleStringParam(unwrappedSearch.page);
  const selectedBookId = getSingleStringParam(unwrappedSearch.selectedBookId);

  // Валидация параметра страницы, которая раньше была в App.tsx
  const isInvalidPageParam = rawPageStr !== '' && !/^\d+$/.test(rawPageStr);
  if (isInvalidPageParam) {
    return <NotFound />;
  }

  const pageStr = rawPageStr || '1';
  const trimmedQuery = rawQuery.trim();
  const isDetailsPanelOpen = !!selectedBookId;

  // FEATURE 9: Серверный запрос для быстрого Initial SSR
  let initialServerData: ServerDataState = { books: [], totalPages: 1 };
  const searchQuery = trimmedQuery || 'A.A.';
  let hasFetchError = false;

  if (trimmedQuery.length >= 3 || trimmedQuery.length === 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // Оптимальный таймаут 3.5 секунды

    let res: Response | null = null;

    try {
      // ИСПРАВЛЕНО: Возвращен обязательный параметр fields для облегчения веса ответа и защиты от сбоев
      const searchParamsBuilder = new URLSearchParams({
        author: searchQuery,
        page: pageStr,
        limit: '20',
        fields: 'key,title,author_name,cover_i,subject,edition_key',
      });

      // Локализуем try/catch строго вокруг fetch, чтобы не мешать редиректам Next.js
      res = await fetch(`https://openlibrary.org/search.json?${searchParamsBuilder.toString()}`, {
        next: { revalidate: 120 },
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);
    } catch {
      clearTimeout(timeoutId);
      hasFetchError = true;
      console.warn('[SSR Network Guard] Using offline mockup fallback due to API lag.');
    }

    // Обработка ответов вынесена за пределы блока try/catch сетевого запроса
    if (res && res.ok) {
      const data = (await res.json()) as OpenLibraryResponse;
      const books: Book[] = (data.docs || []).map((doc: OpenLibraryDoc) => ({
        id: doc.key.replace('/works/', ''),
        title: doc.title,
        author: doc.author_name?.[0] ?? 'Unknown Author',
        category: doc.subject?.[0] ?? 'General',
        // СОХРАНЕНО: Ваши оригинальные ссылки без изменений
        cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
        openLibraryUrl: `https://covers.openlibrary.org/b/olid/${doc.key}`,
      }));

      initialServerData = {
        books,
        totalPages: Math.ceil((data.numFound || 0) / 20) || 1,
      };
    } else if (res && !res.ok) {
      hasFetchError = true;
    }

    // В случае ошибок подкладываем ваш оригинальный офлайн-запасной вариант
    if (hasFetchError) {
      initialServerData = {
        books: [
          {
            id: 'OL27479W',
            title: searchQuery !== 'A.A.' ? `Results for ${searchQuery}` : 'Harry Potter',
            author: 'J.K. Rowling',
            category: 'Fantasy',
            cover: '',
            openLibraryUrl: 'https://openlibrary.org',
          },
        ],
        totalPages: 1,
      };
    }
  }

  const currentPage = parseInt(pageStr, 10);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 relative">
      {/* Интерактивные элементы интерфейса из оригинального App.tsx */}
      <SelectedBooksFlyout />
      <RefreshCacheButton isFetching={false} />
      <div className="fixed bottom-6 right-6 z-40">
        <ErrorButton />
      </div>

      {/* 
        Feature 9: Полный макет приложения (List + Details Panel Area), 
        перенесенный из App.tsx на чистые Серверные Компоненты
      */}
      <div className="grow flex w-full max-w-[1400px] mx-auto relative">
        {/* FEATURE 10: Серверный бэкдроп для закрытия панели по клику мимо нее */}
        {isDetailsPanelOpen ? (
          <form action={handleCloseDetailsAction} className="absolute inset-0 z-10 block w-full h-full">
            <input name="currentQuery" type="hidden" value={trimmedQuery} />
            <input name="currentPage" type="hidden" value={pageStr} />
            <button
              aria-label="Close details"
              className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-xs block w-full h-full cursor-default transition-all"
              type="submit"
            />
          </form>
        ) : null}

        {/* Главная секция со списком результатов */}
        <main
          className={`grow transition-all duration-500 py-12 px-6 z-0 ${
            isDetailsPanelOpen ? 'w-1/2 lg:w-3/5 hidden md:block' : 'w-full'
          }`}
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Блок пагинации на сервере */}
            <div className="mb-8 flex justify-center">
              <Pagination
                current={currentPage}
                selectedBookId={selectedBookId}
                serverQuery={trimmedQuery}
                total={initialServerData.totalPages}
              />
            </div>

            {/* Вывод списка книг с поддержкой активного ID */}
            <div className="books-results-container">
              <BookList
                activeBookId={selectedBookId}
                books={initialServerData.books}
                hasError={hasFetchError}
                serverPage={pageStr}
                serverQuery={trimmedQuery}
              />
            </div>
          </div>
        </main>

        {/* FEATURE 9 & 10: Адаптивная боковая панель с ленивой серверной загрузкой деталей */}
        {isDetailsPanelOpen ? (
          <aside className="w-full md:w-1/2 lg:w-2/5 h-[calc(100vh-88px)] sticky top-[88px] z-20 shrink-0 border-l border-border-custom bg-card/90 backdrop-blur-xl transition-all duration-300 shadow-2xl overflow-y-auto">
            <Suspense
              key={selectedBookId}
              fallback={<div className="animate-pulse text-sm text-slate-400 py-10 text-center">Loading specs...</div>}
            >
              <DetailsPanelShell selectedBookId={selectedBookId} />
            </Suspense>
          </aside>
        ) : null}
      </div>

      {/* Синхронизация состояния с клиентом */}
      <ClientOnly initialServerData={initialServerData} serverPage={pageStr} serverQuery={trimmedQuery} />
    </div>
  );
};

export default Page;
