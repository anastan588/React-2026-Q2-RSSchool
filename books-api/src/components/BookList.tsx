import { Component } from 'react';

import type { Book } from '../services/BooksService';

import BookItem from './BookItem';

interface BookListProps {
  books: Book[];
}

class BookList extends Component<BookListProps> {
  render() {
    const { books } = this.props;

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
  }
}

export default BookList;
