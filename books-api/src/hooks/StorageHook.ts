import { useCallback, useState } from 'react';

import type { StorageState } from '@/types/types';

const STORAGE_KEY = 'search_service_state';
const DEFAULT_STATE: StorageState = {
  query: '',
  page: 1,
};

export const useSearchStorage = () => {
  const [storageState, setStorageState] = useState<StorageState>(() => {
    // Безопасная проверка для сервера (SSR)
    if (typeof window === 'undefined') return DEFAULT_STATE;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as StorageState) : DEFAULT_STATE;
    } catch (error) {
      console.error('Error reading state from localStorage', error);
      return DEFAULT_STATE;
    }
  });

  // Обновляем состояние и localStorage атомарно
  const saveState = useCallback((updatedState: StorageState) => {
    setStorageState(updatedState);
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error saving state to localStorage', error);
    }
  }, []);

  const setSearchQuery = useCallback(
    (query: string): void => {
      const trimmedQuery = query.trim();
      saveState({
        query: trimmedQuery,
        page: 1,
      });
    },
    [saveState],
  );

  const setStoragePage = useCallback((page: number): void => {
    // Ипользуем функциональный апдейт, чтобы всегда иметь свежий стейт
    setStorageState((prev) => {
      const nextState = { ...prev, page };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch (error) {
          console.error('Error saving state to localStorage', error);
        }
      }
      return nextState;
    });
  }, []);

  const clearSearch = useCallback(() => {
    saveState(DEFAULT_STATE);
  }, [saveState]);

  return {
    searchQuery: storageState.query,
    storagePage: storageState.page,
    setSearchQuery,
    setStoragePage,
    clearSearch,
  };
};

export default useSearchStorage;
