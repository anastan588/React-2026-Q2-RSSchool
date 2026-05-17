import { useState } from 'react';

import type { StorageState } from '@/types/types';

const STORAGE_KEY = 'search_service_state';
const DEFAULT_STATE: StorageState = {
  query: '',
  page: 1,
};

export const useSearchStorage = () => {
  const [storageState, setStorageState] = useState<StorageState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as StorageState) : DEFAULT_STATE;
    } catch (error) {
      console.error('Error reading state from localStorage', error);
      return DEFAULT_STATE;
    }
  });

  const saveState = (updatedState: StorageState) => {
    setStorageState(updatedState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error saving state to localStorage', error);
    }
  };

  const setSearchQuery = (query: string): void => {
    const trimmedQuery = query.trim();
    saveState({
      query: trimmedQuery,
      page: 1,
    });
  };

  const setStoragePage = (page: number): void => {
    saveState({
      ...storageState,
      page,
    });
  };

  const clearSearch = (): void => {
    saveState(DEFAULT_STATE);
  };

  return {
    searchQuery: storageState.query,
    storagePage: storageState.page,
    setSearchQuery,
    setStoragePage,
    clearSearch,
  };
};

export default useSearchStorage;
