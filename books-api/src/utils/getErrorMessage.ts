import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | null => {
  if (!error) return null;

  if (
    'status' in error &&
    (error.status === 'FETCH_ERROR' ||
      ('error' in error && typeof error.error === 'string' && error.error.includes('Failed to fetch')))
  ) {
    return 'No internet connection. Please check your network and try again.';
  }

  if ('message' in error && typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
    return 'No internet connection. Please check your network and try again.';
  }

  if ('message' in error && error.message) {
    return error.message;
  }

  if ('status' in error) {
    if (error.data && typeof error.data === 'object' && 'message' in error.data) {
      return String((error.data as Record<string, unknown>).message);
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return 'We could not find the books you are looking for due to an unexpected error.';
};

export default getErrorMessage;
