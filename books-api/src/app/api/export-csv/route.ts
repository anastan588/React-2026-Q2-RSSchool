import { NextResponse } from 'next/server';

import type { Book } from '@/types/types';

const formatCSVField = (value: string | undefined | null): string => {
  if (!value) return '""';
  const cleanValue = String(value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `"${cleanValue.replace(/"/g, '""')}"`;
};

export async function POST(request: Request) {
  try {
    const selectedBooks = (await request.json()) as Book[];
    const count = selectedBooks.length;

    if (count === 0) {
      return NextResponse.json({ error: 'No books selected' }, { status: 400 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const headers = ['Book ID', 'Book Title', 'Author Name', 'Genre', 'App Details Link', 'Description'];

    const rows = selectedBooks.map((book) => {
      const detailsUrl = `${origin}/?selectedBookId=${book.id}`;
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

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${count}_items.csv"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[Server CSV Export Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
