class StorageService {
  private static readonly SEARCH_KEY = 'last_search_query';

  static getSearchQuery(): string {
    return localStorage.getItem(this.SEARCH_KEY) || '';
  }

  static setSearchQuery(query: string): void {
    const trimmedQuery = query.trim();
    localStorage.setItem(this.SEARCH_KEY, trimmedQuery);
  }

  static clearSearch(): void {
    localStorage.removeItem(this.SEARCH_KEY);
  }
}

export default StorageService;
