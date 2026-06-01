import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { describe, expect, it } from 'vitest';

import getErrorMessage from '@/utils/getErrorMessage';

describe('getErrorMessage Utility', () => {
  it('returns null when no error is provided', () => {
    expect(getErrorMessage(undefined)).toBeNull();
  });

  it('extracts human readable text from SerializedError messages thrown by validateStatus', () => {
    const serializedError: SerializedError = {
      message: 'Our library server is currently down. Please try again later.',
    };
    expect(getErrorMessage(serializedError)).toBe('Our library server is currently down. Please try again later.');
  });

  it('transforms TypeError Failed to fetch string inside SerializedError into internet loss layout prompt', () => {
    const serializedError: SerializedError = {
      message: 'TypeError: Failed to fetch',
    };
    expect(getErrorMessage(serializedError)).toBe('No internet connection. Please check your network and try again.');
  });

  it('handles empty message strings inside SerializedError and falls back to default prompt', () => {
    const emptySerializedError: SerializedError = {
      message: '',
    };
    expect(getErrorMessage(emptySerializedError)).toBe(
      'We could not find the books you are looking for due to an unexpected error.',
    );
  });

  it('extracts messages embedded deep within server object data structures', () => {
    const fetchBaseQueryError: FetchBaseQueryError = {
      status: 400,
      data: { message: 'Invalid book identifier format provided.' },
    };
    expect(getErrorMessage(fetchBaseQueryError)).toBe('Invalid book identifier format provided.');
  });

  it('returns explicit error strings for custom pipeline message keys', () => {
    const customFetchError: FetchBaseQueryError = {
      status: 'CUSTOM_ERROR',
      error: 'Custom system failure alert text.',
    };
    expect(getErrorMessage(customFetchError)).toBe('Custom system failure alert text.');
  });

  it('provides a descriptive connection fallback layout upon network FETCH_ERROR scenarios', () => {
    const networkError: FetchBaseQueryError = {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    };
    expect(getErrorMessage(networkError)).toBe('No internet connection. Please check your network and try again.');
  });

  it('handles non-matching string inside status field in FetchBaseQueryError and falls back correctly', () => {
    const stringStatusError: FetchBaseQueryError = {
      status: 'PARSING_ERROR',
      originalStatus: 200,
      data: 'invalid json string',
      error: 'Unexpected token < in JSON at position 0',
    };
    expect(getErrorMessage(stringStatusError)).toBe('Unexpected token < in JSON at position 0');
  });

  it('falls back to the neutral generic layout descriptors when error structures are unidentifiable', () => {
    const unidentifiableError: FetchBaseQueryError = {
      status: 500,
      data: null,
    };
    expect(getErrorMessage(unidentifiableError)).toBe(
      'We could not find the books you are looking for due to an unexpected error.',
    );
  });
});
