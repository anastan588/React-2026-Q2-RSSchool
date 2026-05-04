import type { Book, OpenLibraryDoc } from '@/types/types';

class BookService {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly COVERS_BASE_URL = 'https://covers.openlibrary.org/b';

  static async searchBooks(query: string, options: { page?: number } = {}): Promise<Book[]> {
    const page = options.page || 1;
    const trimmedQuery = query.trim() || 'A.A.';

    const url = new URL(`${this.BASE_URL}/search.json`);
    url.searchParams.set('author', trimmedQuery);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', '50');
    url.searchParams.set('fields', 'key,title,author_name,cover_i,subject,edition_key');

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        this.handleHttpError(response.status);
      }

      const data = await response.json();

      if (!data.docs) return [];

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
    } catch (error) {
      throw new Error('Failed to fetch books. Please check your internet connection.', { cause: error });
    }
  }

  private static handleHttpError(status: number): void {
    if (status >= 500) {
      throw new Error('Our library server is currently down. Please try again later.');
    }
    if (status === 429) {
      throw new Error('Too many requests. Please slow down and try again in a minute.');
    }
    if (status === 404) {
      throw new Error('Search service not found (404). Please contact support.');
    }
    throw new Error('We could not find the books you are looking for due to a client error.');
  }

  private static getCoverUrl(doc: OpenLibraryDoc): string {
    if (doc.cover_i && doc.cover_i > 0) {
      return `${this.COVERS_BASE_URL}/id/${doc.cover_i}-M.jpg`;
    }

    if (doc.edition_key?.[0]) {
      return `${this.COVERS_BASE_URL}/olid/${doc.edition_key[0]}-M.jpg`;
    }

    return './../assets/mock-book.jpg';
  }
}

export default BookService;
