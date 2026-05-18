import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchBookDetails, searchBooks } from '@/services/BooksService';

describe('BookService API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('searchBooks', () => {
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
        json: vi.fn().mockResolvedValue(mockResponseData),
      } as unknown as Response);

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
        json: vi.fn().mockResolvedValue(mockResponseData),
      } as unknown as Response);

      const response = await searchBooks('Empty');
      expect(response.books).toHaveLength(0);
      expect(response.totalPages).toBe(1);
    });

    it('should return an empty books array and 1 total page when docs property is missing', async () => {
      const mockApiResponseWithoutDocs = {
        numFound: 0,
        start: 0,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockApiResponseWithoutDocs),
      } as unknown as Response);

      const result = await searchBooks('some query');

      expect(result.books).toEqual([]);
      expect(result.totalPages).toBe(1);
    });

    it('should return OLID URL when cover_i is missing but edition_key exists', async () => {
      const mockDoc = {
        key: '/works/OL123W',
        title: 'Test Book',
        edition_key: ['OL999M'],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ docs: [mockDoc] }),
      } as unknown as Response);

      const response = await searchBooks('test');
      expect(response.books[0].cover).toBe('https://covers.openlibrary.org/b/olid/OL999M-M.jpg');
    });

    it('should return mock-book.jpg when both cover_i and edition_key are missing', async () => {
      const mockDoc = {
        key: '/works/OL123W',
        title: 'Test Book',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ docs: [mockDoc] }),
      } as unknown as Response);

      const response = await searchBooks('test');
      expect(response.books[0].cover).toBe('./../assets/mock-book.jpg');
    });

    it('handles network failure gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(() => searchBooks('query')).rejects.toThrow('Failed to fetch books');
    });
  });

  describe('searchBooks HTTP Error Statuses', () => {
    it('throws specific error for 500 status', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const execution = () => searchBooks('error');

      await expect(execution).rejects.toThrow('Failed to fetch books');
      await expect(execution).rejects.toSatisfy((error: unknown) => {
        const err = error as Error & { cause: Error };
        return err.cause?.message === 'Our library server is currently down. Please try again later.';
      });
    });

    it('throws specific error for 429 status (Rate Limit)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
      } as Response);

      await expect(() => searchBooks('test')).rejects.toSatisfy((error: unknown) => {
        const err = error as Error & { cause: Error };
        return err.cause?.message === 'Too many requests. Please slow down and try again in a minute.';
      });
    });

    it('throws generic client error for other 4xx statuses', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      await expect(() => searchBooks('test')).rejects.toSatisfy((error: unknown) => {
        const err = error as Error & { cause: Error };
        return err.cause?.message === 'We could not find the books you are looking for due to a client error.';
      });
    });

    it('throws specific error for 404 status (Not Found)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(() => searchBooks('test')).rejects.toSatisfy((error: unknown) => {
        const err = error as Error & { cause: Error };
        return err.cause?.message === 'Search service not found (404). Please contact support.';
      });
    });
  });

  describe('fetchBookDetails', () => {
    it('successfully fetches and transforms a complete book details payload', async () => {
      const mockApiResponse = {
        key: '/works/OL27482W',
        title: 'The Hobbit',
        authors: [{ author: { key: '/authors/OL26320A' } }],
        subjects: ['Fantasy', 'Adventure'],
        covers: [14627509],
        description: 'A tale of high adventure...',
        first_publish_date: 'January 1938',
        subject_places: ['Middle-earth', 'Rivendell', 'Mirkwood'],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response);

      const result = await fetchBookDetails('OL27482W');

      expect(fetch).toHaveBeenCalledWith('https://openlibrary.org/works/OL27482W.json');
      expect(result).toEqual({
        id: '/works/OL27482W',
        title: 'The Hobbit',
        author: 'Details Loaded',
        category: 'Fantasy',
        cover: 'https://covers.openlibrary.org/b/id/14627509-M.jpg',
        openLibraryUrl: 'https://openlibrary.org/works/OL27482W',
        description: 'A tale of high adventure...',
        publishDate: 'January 1938',
        places: ['Middle-earth', 'Rivendell', 'Mirkwood'],
      });
    });

    it('should correctly parse description when it is provided as an object with a value property', async () => {
      const mockApiResponse = {
        key: '/works/OL123W',
        title: 'Test Book Title',
        description: {
          type: '/type/text',
          value: 'This is the expected book description text string.',
        },
        authors: [{ author: { key: '/authors/OL456A' } }],
        subjects: ['Fiction'],
        covers: [12345],
        first_publish_date: '2026',
        subject_places: ['Minsk'],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response);

      const result = await fetchBookDetails('OL123W');

      expect(result.description).toBe('This is the expected book description text string.');
      expect(result.id).toBe('/works/OL123W');
    });

    it('should catch errors and throw a custom error message on network failure', async () => {
      const originalNetworkError = new Error('Network connection timeout');
      vi.mocked(fetch).mockRejectedValue(originalNetworkError);

      const execution = () => fetchBookDetails('OL123W');

      await expect(execution).rejects.toThrow('Failed to fetch individual book profiles.');

      try {
        await execution();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.cause).toBe(originalNetworkError);
        }
      }
    });
  });
});
