import BookItem from '@/components/BookItem';
import type { BookListProps } from '@/types/types';

const BookList = ({ books, hasError }: BookListProps) => {
  if (hasError) {
    return null;
  }

  if (books.length === 0) {
    return <div className="col-span-full py-20 text-center text-muted">No books found. Try a different search!</div>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookList;
