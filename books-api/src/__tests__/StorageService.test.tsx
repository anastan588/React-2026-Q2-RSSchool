import { beforeEach, describe, expect, it, vi } from 'vitest';

import StorageService from '@/hooks/StorageService';

describe('StorageService', () => {
  const SEARCH_KEY = 'last_search_query';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns an empty string if localStorage is empty', () => {
    const query = StorageService.getSearchQuery();
    expect(query).toBe('');
  });

  it('returns the correct value from localStorage', () => {
    const mockValue = 'React Testing';
    localStorage.setItem(SEARCH_KEY, mockValue);

    const query = StorageService.getSearchQuery();
    expect(query).toBe(mockValue);
  });

  it('sets the trimmed search query to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const inputQuery = '  TypeScript  ';

    StorageService.setSearchQuery(inputQuery);
    expect(setItemSpy).toHaveBeenCalledWith(SEARCH_KEY, 'TypeScript');
    expect(localStorage.getItem(SEARCH_KEY)).toBe('TypeScript');
  });

  it('removes the search query from localStorage', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.setItem(SEARCH_KEY, 'to be removed');

    StorageService.clearSearch();

    expect(removeItemSpy).toHaveBeenCalledWith(SEARCH_KEY);
    expect(localStorage.getItem(SEARCH_KEY)).toBeNull();
  });

  it('handles empty string assignment correctly', () => {
    StorageService.setSearchQuery('   ');
    expect(localStorage.getItem(SEARCH_KEY)).toBe('');
  });
});
