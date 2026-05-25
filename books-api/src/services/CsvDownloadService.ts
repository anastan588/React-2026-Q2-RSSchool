import type { Book, GeneratedCsvData } from '@/types/types';

const formatCSVField = (value: string | undefined | null): string => {
  if (!value) return '""';
  const cleanValue = String(value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `"${cleanValue.replace(/"/g, '""')}"`;
};

export const prepareCsvDownload = (selectedBooks: Book[]): GeneratedCsvData | null => {
  const count = selectedBooks.length;
  if (count === 0) return null;

  const headers = ['Book ID', 'Book Title', 'Author Name', 'Genre', 'App Details Link', 'Description'];
  const rows = selectedBooks.map((book) => {
    const detailsUrl = `${window.location.origin}/books/${book.id}`;
    const rawDescription =
      book && typeof book === 'object' && 'description' in book
        ? String((book as Record<string, unknown>).description || '')
        : '';

    return [
      formatCSVField(book.id),
      formatCSVField(book.title),
      formatCSVField(book.author),
      formatCSVField(book.category),
      formatCSVField(detailsUrl),
      formatCSVField(rawDescription),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return {
    url: URL.createObjectURL(blob),
    fileName: `${count}_items.csv`,
  };
};
