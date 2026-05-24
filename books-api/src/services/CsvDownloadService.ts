import type { Book } from '@/types/types';

const formatCSVField = (value: string | undefined | null): string => {
  if (!value) return '""';
  const cleanValue = String(value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `"${cleanValue.replace(/"/g, '""')}"`;
};

export const downloadSelectedBooksAsCSV = (selectedBooks: Book[]): void => {
  const count = selectedBooks.length;
  if (count === 0) return;
  console.log(count);

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
  const url = URL.createObjectURL(blob);
  const fileName = `${count}_items.csv`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
};
