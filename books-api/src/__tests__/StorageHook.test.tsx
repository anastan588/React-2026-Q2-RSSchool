import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useSearchStorage from '@/hooks/StorageHook';

describe('useSearchStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return an empty string by default', () => {
    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('');
  });

  it('should initialize with the value from localStorage', () => {
    localStorage.setItem('last_search_query', 'React');

    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('React');
  });

  it('should save the value and trim whitespace', () => {
    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.setSearchQuery('  Vue.js  ');
    });

    expect(result.current.searchQuery).toBe('Vue.js');
    expect(localStorage.getItem('last_search_query')).toBe('Vue.js');
  });

  it('should clear the value from state and localStorage', () => {
    localStorage.setItem('last_search_query', 'Angular');
    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(localStorage.getItem('last_search_query')).toBeNull();
  });

  it('should gracefully handle localStorage read errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    const { result } = renderHook(() => useSearchStorage());

    expect(result.current.searchQuery).toBe('');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should gracefully handle localStorage write errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useSearchStorage());

    act(() => {
      result.current.setSearchQuery('Svelte');
    });

    // React state should still update for UI responsiveness
    expect(result.current.searchQuery).toBe('Svelte');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
