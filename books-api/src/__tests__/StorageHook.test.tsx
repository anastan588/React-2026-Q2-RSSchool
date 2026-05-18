import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useSearchStorage from '@/hooks/StorageHook';

const STORAGE_KEY = 'search_service_state';

describe('useSearchStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return default state values when localStorage is empty', () => {
    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.storagePage).toBe(1);
  });

  it('should initialize correctly with parsed values from localStorage', () => {
    const savedState = { query: 'React', page: 3 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('React');
    expect(result.current.storagePage).toBe(3);
  });

  it('should save the query, trim whitespace, and reset page automatically to 1', () => {
    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.setSearchQuery('  Vue.js  ');
    });

    expect(result.current.searchQuery).toBe('Vue.js');
    expect(result.current.storagePage).toBe(1);

    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    expect(JSON.parse(storedRaw!)).toEqual({ query: 'Vue.js', page: 1 });
  });

  it('should update the page number without changing the existing search query', () => {
    const savedState = { query: 'Angular', page: 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.setStoragePage(4);
    });

    expect(result.current.searchQuery).toBe('Angular');
    expect(result.current.storagePage).toBe(4);

    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(storedRaw!)).toEqual({ query: 'Angular', page: 4 });
  });

  it('should reset both state properties and update localStorage on clearSearch', () => {
    const savedState = { query: 'Svelte', page: 5 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.storagePage).toBe(1);

    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(storedRaw!)).toEqual({ query: '', page: 1 });
  });

  it('should fallback to default values and log error if localStorage read fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.storagePage).toBe(1);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should update React state even if writing to localStorage fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.setSearchQuery('Next.js');
    });

    expect(result.current.searchQuery).toBe('Next.js');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
