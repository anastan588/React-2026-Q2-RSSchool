import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { booksApi } from '@/services/BooksService';

const createTestStore = () => {
  return configureStore({
    reducer: {
      [booksApi.reducerPath]: booksApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(booksApi.middleware),
  });
};

interface WrapperProps {
  children: React.ReactNode;
}

describe('booksApi Query Integration Tests (Loading, Error, Caching)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('covers loading state during initial fetch', async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'Tolkien', page: 1 }), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('covers error state behavior when API call fails with server down status 500', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'ErrorQuery', page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  it('covers error state behavior when API call fails with status 429', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 429,
        statusText: 'Too Many Requests',
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'LimitQuery', page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('covers error state behavior when API call fails with status 404', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 404,
        statusText: 'Not Found',
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'NotFoundQuery', page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('covers error state behavior when API call fails with status 400', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 400,
        statusText: 'Bad Request',
      }),
    );

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'BadRequestQuery', page: 1 }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('covers caching behavior between identical requests', async () => {
    const mockData = {
      numFound: 1,
      docs: [
        {
          key: '/works/OL123W',
          title: 'Cached Book',
          author_name: ['Author'],
          subject: ['Genre'],
          cover_i: 123,
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue(Response.json(mockData));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result: firstRender } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'CacheTest', page: 1 }), {
      wrapper,
    });

    await waitFor(() => {
      expect(firstRender.current.isSuccess).toBe(true);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    const { result: secondRender } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'CacheTest', page: 1 }), {
      wrapper,
    });

    await waitFor(() => {
      expect(secondRender.current.isSuccess).toBe(true);
    });

    expect(secondRender.current.data).toEqual(firstRender.current.data);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('covers transformResponse fallbacks in searchBooks when docs array is missing', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ numFound: 0 }));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'EmptyQuery', page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ books: [], totalPages: 1 });
  });

  it('covers cover layout fallbacks inside transformResponse using edition_key and completely missing assets', async () => {
    const mockMixedData = {
      numFound: 2,
      docs: [
        {
          key: '/works/OL111W',
          title: 'Edition Cover Book',
          author_name: undefined,
          subject: undefined,
          edition_key: ['OL111E'],
        },
        {
          key: '/works/OL222W',
          title: 'No Cover Book',
          author_name: undefined,
          subject: undefined,
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue(Response.json(mockMixedData));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useSearchBooksQuery({ query: 'MixedCovers', page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.books[0].cover).toContain('olid/OL111E-M.jpg');
    expect(result.current.data?.books[1].author).toBe('Unknown Author');
    expect(result.current.data?.books[1].category).toBe('General');
    expect(result.current.data?.books[1].cover).toBe('./../assets/mock-book.jpg');
  });

  it('successfully executes fetchBookDetails endpoint and transforms plain description string profiles', async () => {
    const mockDetailsData = {
      key: '/works/OL999W',
      title: 'Details Title',
      authors: [{}],
      subjects: ['History'],
      covers: [999],
      first_publish_date: '1999',
      subject_places: ['London'],
      description: 'Plain description string test',
    };

    vi.mocked(fetch).mockResolvedValue(Response.json(mockDetailsData));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useFetchBookDetailsQuery('/works/OL999W'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: '/works/OL999W',
      title: 'Details Title',
      author: 'Details Loaded',
      category: 'History',
      cover: 'https://covers.openlibrary.org/b/id/999-M.jpg',
      openLibraryUrl: 'https://openlibrary.org/works/OL999W',
      description: 'Plain description string test',
      publishDate: '1999',
      places: ['London'],
    });
  });

  it('executes fetchBookDetails endpoint and extracts descriptions embedded within object structures', async () => {
    const mockDetailsObjectDescription = {
      title: 'Object Description Title',
      description: { value: 'Embedded object description value text' },
    };

    vi.mocked(fetch).mockResolvedValue(Response.json(mockDetailsObjectDescription));

    const store = createTestStore();
    const wrapper = ({ children }: WrapperProps) => <Provider store={store}>{children}</Provider>;

    const { result } = renderHook(() => booksApi.useFetchBookDetailsQuery('OL888W'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.description).toBe('Embedded object description value text');
    expect(result.current.data?.cover).toBe('./../assets/mock-book.jpg');
    expect(result.current.data?.author).toBe('Unknown Author');
  });
});
