// src/services/BookService.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  openLibraryUrl: string; // Ссылка на оригинал (courtesy link)
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  subject?: string[];
  cover_i?: number;
  edition_key?: string[]; // OLID первого издания
}

class BookService {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly COVERS_BASE_URL = 'https://covers.openlibrary.org/b';

  static async searchBooks(query: string, signal?: AbortSignal): Promise<Book[]> {
    const searchQuery = query.trim() || 'top books';
    const params = new URLSearchParams({
      q: searchQuery,
      limit: '50',
      fields: 'key,title,author_name,cover_i,subject,edition_key',
    });

    const response = await fetch(`${this.BASE_URL}/search.json?${params}`, { signal });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error('Our library server is currently down. Please try again later.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please slow down and try again in a minute.');
      }
      throw new Error('We could not find the books you are looking for due to a client error.');
    }

    const data = await response.json();

    return data.docs.map(
      (doc: OpenLibraryDoc): Book => ({
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] ?? 'Unknown Author',
        category: doc.subject?.[0] ?? 'General',
        cover: this.getCoverUrl(doc),
        openLibraryUrl: `${this.BASE_URL}${doc.key}`,
      }),
    );
  }

  private static getCoverUrl(doc: OpenLibraryDoc): string {
    if (doc.cover_i && doc.cover_i > 0) {
      return `${this.COVERS_BASE_URL}/id/${doc.cover_i}-M.jpg?default=false`;
    }

    if (doc.edition_key?.[0]) {
      return `${this.COVERS_BASE_URL}/olid/${doc.edition_key[0]}-M.jpg?default=false`;
    }
    return 'https://placehold.co';
  }
}

export default BookService;
