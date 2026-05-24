import type { ChangeEvent, ReactNode } from 'react';

export interface AppState {
  query: string;
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

export interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'search' | 'number';
  className?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  openLibraryUrl: string;
}

export interface SearchBooksResponse {
  books: Book[];
  totalPages: number;
}

export interface ExtendedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  openLibraryUrl: string;
  description: string;
  publishDate: string;
  places: string[];
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
  onBookSelect?: (book: Book) => void;
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

//LocalStorage

export interface StorageState {
  query: string;
  page: number;
}

//Pangination
export interface PaginationProps {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}

// State

export interface SelectedState {
  selectedBooks: Book[];
}

export interface BookSelectionCheckboxProps {
  book: Book;
}
