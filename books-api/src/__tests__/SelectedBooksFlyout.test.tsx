import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SelectedBooksFlyout from '@/components/SelectedFlayout';
import { prepareCsvDownload } from '@/services/CsvDownloadService';
import selectedReducer from '@/state/selectedSlice';
import type { Book } from '@/types/types';

vi.mock('@/services/CsvDownloadService', () => ({
  prepareCsvDownload: vi.fn(),
}));

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Book One',
    author: 'Author One',
    category: 'Fiction',
    cover: 'cover1.jpg',
    openLibraryUrl: 'https://openlibrary.org',
  },
  {
    id: '2',
    title: 'Book Two',
    author: 'Author Two',
    category: 'Science',
    cover: 'cover2.jpg',
    openLibraryUrl: 'https://openlibrary.org',
  },
];

const renderWithProvider = (initialBooks: Book[] = []) => {
  const store = configureStore({
    reducer: {
      selectedReducer: selectedReducer,
    },
    preloadedState: {
      selectedReducer: { selectedBooks: initialBooks },
    },
  });

  return {
    ...render(
      <Provider store={store}>
        <SelectedBooksFlyout />
      </Provider>,
    ),
    store,
  };
};

describe('SelectedBooksFlyout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.revokeObjectURL = vi.fn();
  });

  it('returns null and does not render when no books are selected', () => {
    renderWithProvider([]);
    expect(screen.queryByTestId('selected-items-flyout')).not.toBeInTheDocument();
  });

  it('renders correct count label and singular grammar description for one selected item', () => {
    renderWithProvider([mockBooks[0]]);

    expect(screen.getByTestId('selected-items-flyout')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('book selected')).toBeInTheDocument();
  });

  it('renders correct plural grammar description for multiple selected items', () => {
    renderWithProvider(mockBooks);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('books selected')).toBeInTheDocument();
  });

  it('dispatches clearBooks action sequence when unselect all action triggers', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProvider(mockBooks);

    const unselectAllButton = screen.getByRole('button', { name: /unselect all/i });
    await user.click(unselectAllButton);

    expect(store.getState().selectedReducer.selectedBooks).toEqual([]);
  });

  it('generates csv transmission payload and triggers anchor download sequence on click', async () => {
    const user = userEvent.setup();
    const mockCsvMeta = { url: 'blob:mock-url', fileName: 'selected_books.csv' };
    vi.mocked(prepareCsvDownload).mockReturnValue(mockCsvMeta);

    renderWithProvider(mockBooks);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    const hiddenAnchor = document.querySelector('a');

    const clickSpy = vi.spyOn(hiddenAnchor!, 'click');

    await user.click(downloadButton);

    expect(prepareCsvDownload).toHaveBeenCalledWith(mockBooks);

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
