import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Book, ExtendedBook, OpenLibraryDoc, SearchBooksResponse } from '@/types/types';

const BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org/b';
const ITEMS_PER_PAGE = 20;

const getCacheTtl = (): number => {
  const metaEnv = import.meta.env as ImportMetaEnv & { VITE_CACHE_TTL?: string };
  const ttl = metaEnv.VITE_CACHE_TTL;
  return ttl ? Number(ttl) : 60;
};

const CACHE_TTL_SECONDS = getCacheTtl();

const getCoverUrl = (doc: OpenLibraryDoc): string => {
  if (doc.cover_i && doc.cover_i > 0) {
    return `${COVERS_BASE_URL}/id/${doc.cover_i}-M.jpg`;
  }

  if (doc.edition_key?.[0]) {
    return `${COVERS_BASE_URL}/olid/${doc.edition_key[0]}-M.jpg`;
  }

  return './../assets/mock-book.jpg';
};

export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    validateStatus: (response) => {
      if (response.status >= 500) {
        throw new Error('Our library server is currently down. Please try again later.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please slow down and try again in a minute.');
      }
      if (response.status === 404) {
        throw new Error('Search service not found (404). Please contact support.');
      }
      if (!response.ok) {
        throw new Error('We could not find the books you are looking for due to a client error.');
      }
      return response.ok;
    },
  }),
  tagTypes: ['Books', 'BookDetails'],
  keepUnusedDataFor: CACHE_TTL_SECONDS,
  endpoints: (builder) => ({
    searchBooks: builder.query<SearchBooksResponse, { query: string; page: number }>({
      query: ({ query, page }) => {
        const trimmedQuery = query.trim() || 'A.A.';
        return {
          url: '/search.json',
          params: {
            author: trimmedQuery,
            page: page.toString(),
            limit: ITEMS_PER_PAGE.toString(),
            fields: 'key,title,author_name,cover_i,subject,edition_key',
          },
        };
      },
      providesTags: (_result, _error, arg) => [{ type: 'Books', id: `${arg.query}-${arg.page}` }],
      transformResponse: (data: { docs?: OpenLibraryDoc[]; numFound?: number }): SearchBooksResponse => {
        if (!data.docs) {
          return { books: [], totalPages: 1 };
        }

        const books = data.docs.map(
          (doc: OpenLibraryDoc): Book => ({
            id: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] ?? 'Unknown Author',
            category: doc.subject?.[0] ?? 'General',
            cover: getCoverUrl(doc),
            openLibraryUrl: `${BASE_URL}${doc.key}`,
          }),
        );

        const totalItems = data.numFound || 0;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

        return { books, totalPages };
      },
    }),
    fetchBookDetails: builder.query<ExtendedBook, string>({
      query: (bookId) => {
        const cleanedId = bookId.startsWith('/') ? bookId.substring(1) : `works/${bookId}`;
        return { url: `/${cleanedId}.json` };
      },
      providesTags: (_result, _error, bookId) => [{ type: 'BookDetails', id: bookId }],
      transformResponse: (
        data: {
          key?: string;
          title?: string;
          authors?: unknown[];
          subjects?: string[];
          covers?: number[];
          first_publish_date?: string;
          subject_places?: string[];
          description?: string | { value: string };
        },
        _meta,
        bookId,
      ): ExtendedBook => {
        let parsedDescription = 'No summary profile registered for this edition.';

        if (typeof data.description === 'string') {
          parsedDescription = data.description;
        } else if (data.description && typeof data.description === 'object' && 'value' in data.description) {
          parsedDescription = data.description.value;
        }

        return {
          id: data.key ?? bookId,
          title: data.title ?? 'Unknown Title',
          author: data.authors ? 'Details Loaded' : 'Unknown Author',
          category: data.subjects?.[0] ?? 'General',
          cover: data.covers?.[0] ? `${COVERS_BASE_URL}/id/${data.covers[0]}-M.jpg` : './../assets/mock-book.jpg',
          openLibraryUrl: `${BASE_URL}${data.key ?? bookId}`,
          description: parsedDescription,
          publishDate: data.first_publish_date ?? 'Unknown Date',
          places: data.subject_places?.slice(0, 4) || [],
        };
      },
    }),
  }),
});

export const { useSearchBooksQuery, useFetchBookDetailsQuery } = booksApi;
