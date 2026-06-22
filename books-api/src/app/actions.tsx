// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Вспомогательная функция для чистой сборки параметров URL.
 * Убирает дефолтные параметры (?page=1), разгружая адресную строку.
 */
function buildUrl(query: string, page: string, bookId?: string | null): string {
  const params = new URLSearchParams();

  // Сохраняем поисковый запрос, если он не дефолтный
  if (query && query !== 'A.A.') {
    params.set('q', query);
  }

  // ОПТИМИЗАЦИЯ: Если страница первая, не пишем её в URL для сохранения чистоты адреса
  if (page && page !== '1') {
    params.set('page', page);
  }

  // Применяем ID выбранной книги
  if (bookId) {
    params.set('selectedBookId', bookId);
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}

export async function handleSearchAction(formData: FormData): Promise<never> {
  const query = ((formData.get('q') as string) || '').trim();
  const targetUrl = buildUrl(query, '1', null);

  return redirect(targetUrl);
}

export async function handlePageChangeAction(formData: FormData): Promise<never> {
  const page = (formData.get('page') as string) || '1';
  const currentQuery = (formData.get('currentQuery') as string) || '';
  const selectedBookId = (formData.get('selectedBookId') as string) || null;

  const targetUrl = buildUrl(currentQuery, page, selectedBookId);

  return redirect(targetUrl);
}

export async function handleBookSelectAction(formData: FormData): Promise<never> {
  const bookId = formData.get('bookId') as string;
  const currentQuery = (formData.get('currentQuery') as string) || '';
  const currentPage = (formData.get('currentPage') as string) || '1';

  const targetUrl = buildUrl(currentQuery, currentPage, bookId);

  return redirect(targetUrl);
}

export async function handleCloseDetailsAction(formData: FormData): Promise<never> {
  const currentQuery = (formData.get('currentQuery') as string) || '';
  const currentPage = (formData.get('currentPage') as string) || '1';

  const targetUrl = buildUrl(currentQuery, currentPage, null);

  return redirect(targetUrl);
}

export async function handleRefreshServerCacheAction(): Promise<void> {
  // Полностью очищаем кэш данных (Data Cache) на сервере для текущего роута
  revalidatePath('/', 'page');
}
