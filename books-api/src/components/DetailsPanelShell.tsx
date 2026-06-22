import { getTranslations } from 'next-intl/server';

import { BookDetails } from '@/components/BookDetails';
import type { ExtendedBook } from '@/types/types';

interface DetailsPanelShellProps {
  selectedBookId: string;
}

const BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org/b';

const getBookDetailsOnServer = async (id: string): Promise<ExtendedBook | null> => {
  const cleanedId = id.startsWith('/') ? id.substring(1) : `works/${id}`;
  const cacheTtl = process.env.NEXT_PUBLIC_CACHE_TTL ? Number(process.env.NEXT_PUBLIC_CACHE_TTL) : 120;
  const t = await getTranslations('Details');

  try {
    const res = await fetch(`${BASE_URL}/${cleanedId}.json`, {
      next: { revalidate: cacheTtl },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    let parsedDescription = t('fallbackDescription');
    if (typeof data.description === 'string') {
      parsedDescription = data.description;
    } else if (data.description && typeof data.description === 'object' && 'value' in data.description) {
      parsedDescription = data.description.value;
    }

    const rawKey = data.key || id;
    const cleanId = rawKey.replace(/^\/?works\//, '').replace(/^\//, '');

    return {
      id: cleanId,
      title: data.title ?? 'Unknown Title',
      author: data.authors ? 'Details Loaded' : 'Unknown Author',
      category: data.subjects?.[0] ?? 'General',
      cover: data.covers?.[0] ? `${COVERS_BASE_URL}/id/${data.covers[0]}-M.jpg` : '',
      openLibraryUrl: `${BASE_URL}${data.key ?? id}`,
      description: parsedDescription,
      publishDate: data.first_publish_date ?? 'Unknown Date',
      places: data.subject_places?.slice(0, 4) || [],
    };
  } catch (err) {
    console.error('[Server Fetch Error] Failed to get book details:', err);
    return null;
  }
};

export const DetailsPanelShell = async ({ selectedBookId }: DetailsPanelShellProps) => {
  const t = await getTranslations('BookDetails');

  if (!selectedBookId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted text-sm py-20 text-center bg-card/10 backdrop-blur-md rounded-xl border border-border-custom">
        <svg className="w-12 h-12 text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <span className="font-medium tracking-wide">{t('emptyMessage')}</span>
      </div>
    );
  }

  const initialData = await getBookDetailsOnServer(selectedBookId);

  return <BookDetails key={selectedBookId} id={selectedBookId} initialData={initialData} />;
};

export default DetailsPanelShell;
