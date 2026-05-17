import { useState } from 'react';

const SEARCH_KEY = 'last_search_query';

export const useSearchStorage = () => {
  const [searchQuery, setSearchQueryState] = useState<string>(() => {
    try {
      return localStorage.getItem(SEARCH_KEY) || '';
    } catch (error) {
      console.error('Error reading localStorage', error);
      return '';
    }
  });

  const setSearchQuery = (query: string): void => {
    try {
      const trimmedQuery = query.trim();
      setSearchQueryState(trimmedQuery);
      localStorage.setItem(SEARCH_KEY, trimmedQuery);
    } catch (error) {
      console.error('Error setting localStorage', error);
    }
  };

  const clearSearch = (): void => {
    try {
      setSearchQueryState('');
      localStorage.removeItem(SEARCH_KEY);
    } catch (error) {
      console.error('Error removing localStorage', error);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
  };
};

export default useSearchStorage;
