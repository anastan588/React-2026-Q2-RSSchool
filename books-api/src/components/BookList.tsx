import BookItem from '@/components/BookItem';
import type { BookListProps } from '@/types/types';

export const BookList = ({ books, hasError, onBookSelect }: BookListProps) => {
  if (hasError) {
    return null;
  }

  if (books.length === 0) {
    return <div className="col-span-full py-20 text-center text-muted">No books found. Try a different search!</div>;
  }

  return (
    <div className="book-grid" data-testid="book-grid">
      {books.map((book) => (
        <div
          key={book.id}
          onClick={(e) => {
            e.stopPropagation();
            onBookSelect?.(book);
          }}
        >
          <BookItem book={book} />
        </div>
      ))}
    </div>
  );
};

export default BookList;
