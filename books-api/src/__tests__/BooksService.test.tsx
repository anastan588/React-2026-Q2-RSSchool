import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchBooks } from '@/services/BooksService';

describe('BookService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('successfully fetches, transforms book data, and calculates totalPages', async () => {
    const mockResponseData = {
      numFound: 105,
      docs: [
        {
          key: '/works/123',
          title: 'Test Book',
          author_name: ['Test Author'],
          subject: ['Test Category'],
          cover_i: 456,
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response);

    const response = await searchBooks('Tolkien');
    expect(response.books).toHaveLength(1);
    expect(response.totalPages).toBe(6);

    const firstBook = response.books[0];
    expect(firstBook.title).toBe('Test Book');
    expect(firstBook.author).toBe('Test Author');
  });

  it('defaults totalPages to 1 when numFound is missing or zero', async () => {
    const mockResponseData = {
      numFound: 0,
      docs: [],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response);

    const response = await searchBooks('Empty');
    expect(response.books).toHaveLength(0);
    expect(response.totalPages).toBe(1);
  });

  it('throws specific error for 500 status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const promise = searchBooks('error');

    await expect(promise).rejects.toThrow('Failed to fetch books');
    await expect(promise).rejects.toSatisfy((error: unknown) => {
      const err = error as Error & { cause: Error };
      return err.cause?.message === 'Our library server is currently down. Please try again later.';
    });
  });

  it('throws specific error for 429 status (Rate Limit)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    const promise = searchBooks('test');

    await expect(promise).rejects.toSatisfy((error: unknown) => {
      const err = error as Error & { cause: Error };
      return err.cause?.message === 'Too many requests. Please slow down and try again in a minute.';
    });
  });

  it('throws generic client error for other 4xx statuses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
    } as Response);

    const promise = searchBooks('test');

    await expect(promise).rejects.toSatisfy((error: unknown) => {
      const err = error as Error & { cause: Error };
      return err.cause?.message === 'We could not find the books you are looking for due to a client error.';
    });
  });

  it('throws specific error for 404 status (Not Found)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const promise = searchBooks('test');

    await expect(promise).rejects.toSatisfy((error: unknown) => {
      const err = error as Error & { cause: Error };
      return err.cause?.message === 'Search service not found (404). Please contact support.';
    });
  });

  it('handles network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await expect(searchBooks('query')).rejects.toThrow('Failed to fetch books');
  });

  it('should return OLID URL when cover_i is missing but edition_key exists', async () => {
    const mockDoc = {
      key: '/works/OL123W',
      title: 'Test Book',
      edition_key: ['OL999M'],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [mockDoc] }),
    } as Response);

    const response = await searchBooks('test');
    const book = response.books[0];

    expect(book.cover).toBe('https://covers.openlibrary.org/b/olid/OL999M-M.jpg');
  });

  it('should return mock-book.jpg when both cover_i and edition_key are missing', async () => {
    const mockDoc = {
      key: '/works/OL123W',
      title: 'Test Book',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [mockDoc] }),
    } as Response);

    const response = await searchBooks('test');
    const book = response.books[0];

    expect(book.cover).toBe('./../assets/mock-book.jpg');
  });
});
