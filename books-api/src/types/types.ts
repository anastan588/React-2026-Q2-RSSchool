import type { ReactNode } from 'react';

export interface AppState {
  query: string;
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  openLibraryUrl: string;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  subject?: string[];
  cover_i?: number;
  edition_key?: string[];
}

export interface BookItemProps {
  book: Book;
}

export interface BookListProps {
  books: Book[];
  hasError: boolean;
}

export interface LoaderProps {
  query: string;
}

// SearchField

export interface SearchFieldState {
  localQuery: string;
  showError: boolean;
}

export interface SearchFieldProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

//Error Boundary
export interface BoundaryProps {
  children: ReactNode;
}

export interface BoundaryState {
  hasError: boolean;
}

//Error Button
export interface StateErrorButton {
  shouldCrash: boolean;
}

// Error Message
export interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}
