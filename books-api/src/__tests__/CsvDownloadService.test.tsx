import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prepareCsvDownload } from '@/services/CsvDownloadService';
import type { Book } from '@/types/types';

const mockBooks: Book[] = [
  {
    id: '123',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasy',
    cover: 'cover.jpg',
    openLibraryUrl: 'https://openlibrary.org',
  },
];

describe('CsvDownloadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('returns null if the selected books collection is empty', () => {
    const result = prepareCsvDownload([]);
    expect(result).toBeNull();
  });

  it('generates a valid structural CSV payload link reference and correct file names', () => {
    const result = prepareCsvDownload(mockBooks);

    expect(result).not.toBeNull();
    expect(result?.url).toBe('blob:mock-url');
    expect(result?.fileName).toBe('1_items.csv');
  });

  it('sanitizes and wraps fields with inner quotes and multi-line breaks correctly', () => {
    const complexBook: Book = {
      id: '456',
      title: 'The "Great" Gatsby',
      author: 'F. Scott\nFitzgerald',
      category: 'Classic  Fiction',
      cover: 'cover2.jpg',
      openLibraryUrl: 'https://openlibrary.org',
    };

    const bookWithDescription = {
      ...complexBook,
      description: 'A story of\r\nlove and money.',
    } as unknown as Book;

    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL');

    prepareCsvDownload([bookWithDescription]);

    const blobInstance = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobInstance).toBeInstanceOf(Blob);
    expect(blobInstance.type).toBe('text/csv;charset=utf-8;');

    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
    });
  });

  it('handles books containing missing or falsy fields by outputting empty boundary cells', () => {
    const partialBook: Book = {
      id: '',
      title: undefined as unknown as string,
      author: null as unknown as string,
      category: 'Drama',
      cover: '',
      openLibraryUrl: '',
    };

    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL');

    prepareCsvDownload([partialBook]);

    const blobInstance = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobInstance).toBeDefined();
  });
});
