import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchBooks } from '@/services/BooksService';

describe('BookService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('successfully fetches and transforms book data', async () => {
    const mockResponseData = {
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

    const books = await searchBooks('Tolkien');

    expect(books).toHaveLength(1);
    const [firstBook] = books;
    expect(firstBook.title).toBe('Test Book');
  });

  it('throws specific error for 500 status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    try {
      await searchBooks('error');
    } catch (error) {
      const err = error as Error & { cause: Error };
      expect(err.message).toContain('Failed to fetch books');
      expect(err.cause.message).toBe('Our library server is currently down. Please try again later.');
    }
  });

  it('throws specific error for 429 status (Rate Limit)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    try {
      await searchBooks('test');
    } catch (error) {
      const err = error as Error & { cause: Error };
      expect(err.cause.message).toBe('Too many requests. Please slow down and try again in a minute.');
    }
  });

  it('throws generic client error for other 4xx statuses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
    } as Response);

    try {
      await searchBooks('test');
    } catch (error) {
      const err = error as Error & { cause: Error };
      expect(err.cause.message).toBe('We could not find the books you are looking for due to a client error.');
    }
  });

  it('throws specific error for 404 status (Not Found)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    try {
      await searchBooks('test');
    } catch (error) {
      const err = error as Error & { cause: Error };
      expect(err.cause.message).toBe('Search service not found (404). Please contact support.');
    }
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

    const [book] = await searchBooks('test');

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

    const [book] = await searchBooks('test');
    expect(book.cover).toBe('./../assets/mock-book.jpg');
  });
});
