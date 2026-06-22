import { getTranslations } from 'next-intl/server';

import BookItem from '@/components/BookItem';
import { Link } from '@/i18n/routing';
import type { Book, BookListProps } from '@/types/types';

export const BookList = async ({
  books,
  hasError,
  serverPage = '1',
  serverQuery = '',
  activeBookId = '',
}: BookListProps) => {
  const t = await getTranslations('App');

  if (hasError) {
    return null;
  }

  if (books.length === 0) {
    return <div className="col-span-full py-20 text-center text-muted">{t('noBooks')}</div>;
  }

  return (
    <div className="book-grid" data-testid="book-grid">
      {books.map((book: Book) => {
        const isSelected = book.id === activeBookId;

        return (
          <Link
            key={book.id}
            className={`block no-underline text-inherit cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform duration-200 active:scale-98 ${
              isSelected ? 'bg-primary/10 ring-1 ring-primary/20' : ''
            }`}
            href={`/?q=${encodeURIComponent(serverQuery)}&page=${serverPage}&selectedBookId=${encodeURIComponent(book.id)}`}
            scroll={false}
          >
            <BookItem book={book} />
          </Link>
        );
      })}
    </div>
  );
};

export default BookList;
