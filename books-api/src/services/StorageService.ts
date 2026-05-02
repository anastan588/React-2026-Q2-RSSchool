class StorageService {
  private static readonly SEARCH_KEY = 'last_search_query';

  static getSearchQuery(): string {
    return localStorage.getItem(this.SEARCH_KEY) || '';
  }

  static setSearchQuery(query: string): void {
    localStorage.setItem(this.SEARCH_KEY, query);
  }

  static clearSearch(): void {
    localStorage.removeItem(this.SEARCH_KEY);
  }
}

export default StorageService;
