// src/components/BookList.tsx
import Link from 'next/link';

import BookItem from '@/components/BookItem';
import type { Book, BookListProps } from '@/types/types';

// Расширяем параметры для возможности чтения текущих параметров поиска прямо на сервере
export const BookList = ({ books, hasError, serverPage = '1', serverQuery = '' }: BookListProps) => {
  if (hasError) {
    return null;
  }

  if (books.length === 0) {
    return <div className="col-span-full py-20 text-center text-muted">No books found. Try a different search!</div>;
  }

  return (
    <div className="book-grid" data-testid="book-grid">
      {books.map((book: Book) => (
        /* 
          ФИЧА 10 (Server Selection): Переход осуществляется через нативный Link. 
          Мы передаем чистую строку URL с сохранением текущей страницы, поискового запроса 
          и установкой ID выбранной книги. Это избавляет от передачи функций через пропсы, 
          ликвидирует ошибку компиляции и триггерит серверный fetch деталей в DetailsPanelShell.
        */
        <Link
          key={book.id}
          className="block no-underline text-inherit cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform duration-200 active:scale-98"
          href={`/?q=${encodeURIComponent(serverQuery)}&page=${serverPage}&selectedBookId=${encodeURIComponent(book.id)}`}
        >
          <BookItem book={book} />
        </Link>
      ))}
    </div>
  );
};

export default BookList;
